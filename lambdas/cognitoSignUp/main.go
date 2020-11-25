package main

import (
	"fmt"
	"log"
	"os"
	"encoding/json"
	"context"
	"time"

	"github.com/mitchellh/mapstructure"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/aws/external"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"

	"github.com/aws/aws-sdk-go-v2/service/dynamodb/dynamodbattribute"
	"github.com/aws/aws-sdk-go/aws"
)

type event map[string]interface{}

type output interface{}

type CognitoEvent struct {
	Version       string `json:"version"`
	TriggerSource string `json:"triggerSource"`
	Region        string `json:"region"`
	UserPoolID    string `json:"userPoolId"`
	UserName      string `json:"userName"`
	CallerContext struct {
		AwsSdkVersion string `json:"awsSdkVersion"`
		ClientID      string `json:"clientId"`
	} `json:"callerContext"`
	Request struct {
		UserAttributes struct {
			Email     string `json:"email"`
			LastName  string `json:"family_name" mapstructure:"family_name"`
			FirstName string `json:"name" mapstructure:"name"`
		} `json:"userAttributes"`
	} `json:"request"`
	Response map[string]interface{}
}

type CognitoPreSignUpResponse struct {
	AutoConfirmUser bool `json:"autoConfirmUser"`
	AutoVerifyEmail bool `json:"autoVerifyEmail"`
	AutoVerifyPhone bool `json:"autoVerifyPhone"`
}

type RegisterUserInput struct {
	ID             string `json:"id"`
	Email          string `json:"email"`
	FirstName      string `json:"firstName"`
	LastName       string `json:"lastName"`
	IdentityPoolId string `json:"identityPoolId"`
}


func RegisterUser(input *RegisterUserInputData) error {

	// item
	dynamoItem, err := dynamodbattribute.MarshalMap(input.RegisterUserInputData)
	if err != nil {
		return err
	}

	now := time.Now().Format(time.RFC3339)
	dynamoNow, err := dynamodbattribute.Marshal(now)
	if err != nil {
		return err
	}

	// dynamoItem["currency"] = dynamodb.AttributeValue{
	// 	S: aws.String("nzd"),
	// }
	// dynamoItem["balance"] = dynamodb.AttributeValue{
	// 	N: aws.String("0"),
	// }
	// dynamoItem["useBalance"] = dynamodb.AttributeValue{
	// 	BOOL: aws.Bool(false),
	// }
	dynamoItem["createdAt"] = *dynamoNow
	dynamoItem["updatedAt"] = *dynamoNow
	dynamoItem["owner"] = dynamoItem["id"]
	dynamoItem["identityPoolId"] = dynamodb.AttributeValue{
		S: aws.String(""),
	}
	// dynamoItem["__typename"] = dynamodb.AttributeValue{
	// 	S: aws.String("User"),
	// }

	//
	condExpr := "attribute_not_exists(#i)"
	exprAttrNames := map[string]string{
		"#i": "id",
	}

	pi := dynamodb.PutItemInput{
		TableName:                aws.String(input.UserTableName),
		Item:                     dynamoItem,
		ConditionExpression:      aws.String(condExpr),
		ExpressionAttributeNames: exprAttrNames,
	}

	req := input.DynamodbClient.PutItemRequest(&pi)
	_, err = req.Send(context.Background())
	if err != nil {
		return err
	}

	return nil
}

type RegisterUserInputData struct {
	DynamodbClient    *dynamodb.Client
	UserTableName     string
	RegisterUserInputData *RegisterUserInput
}

func GetJSONFromObject(object interface{}) (string, error) {
	objectJSON, err := json.Marshal(object)
	if err != nil {
		return "", err
	}

	objectJSONString := string(objectJSON)
	return objectJSONString, nil
}

func DebugEvent(event interface{}) error {
	eventJSON, err := GetJSONFromObject(event)
	if err != nil {
		return err
	}

	fmt.Printf("Event: %v\n", eventJSON)
	return nil
}

var errorLog log.Logger

func init() {
	errorLog = *log.New(os.Stderr, "ERROR: ", log.Ldate|log.Ltime)
}

func handler(event event) (output, error) {

	DebugEvent(event)
	output := event

	// Validate envvars
	userTableName := os.Getenv("USER_TABLE_NAME")
	// userTableName, err := getenv.Str("USER_TABLE_NAME")
	// if err != nil {
	// 	str := "Failed to get USER_TABLE_NAME: %v\n"
	// 	errorLog.Printf(str, err)
	// 	return output, fmt.Errorf(str, err)
	// }

	// Load dynamodbClient
	cfg, err := external.LoadDefaultAWSConfig()
	if err != nil {
		// panic(err)
	}
	dynamodbClient := dynamodb.New(cfg)

	// Register
	cognitoEvent := CognitoEvent{}
	mapstructure.Decode(event, &cognitoEvent)

	if event["triggerSource"] == "PreSignUp_AdminCreateUser" {
		// register admin created user
		fmt.Println("Registering admin created user in database..")
		ri := RegisterUserInputData{
			DynamodbClient: dynamodbClient,
			UserTableName:  userTableName,
			RegisterUserInputData: &RegisterUserInput{
				ID:    cognitoEvent.UserName,
				Email: cognitoEvent.Request.UserAttributes.Email,
			},
		}

		err := RegisterUser(&ri)
		if err != nil {
			str := "Failed to register user: %v\n"
			errorLog.Printf(str, err)
			return output, fmt.Errorf(str, err)
		}

	} else if event["triggerSource"] == "PreSignUp_SignUp" {
		// register self signed up user
		fmt.Println("Registering self signed up user in database..")
		ri := RegisterUserInputData{
			DynamodbClient: dynamodbClient,
			UserTableName:  userTableName,
			RegisterUserInputData: &RegisterUserInput{
				ID:        cognitoEvent.UserName,
				Email:     cognitoEvent.Request.UserAttributes.Email,
				FirstName: cognitoEvent.Request.UserAttributes.FirstName,
				LastName:  cognitoEvent.Request.UserAttributes.LastName,
			},
		}

		err := RegisterUser(&ri)
		if err != nil {
			str := "Failed to register user: %v\n"
			errorLog.Printf(str, err)
			return output, fmt.Errorf(str, err)
		}
	} else if event["triggerSource"] == "PreSignUp_ExternalProvider" {
		// register self google signed up user
		fmt.Println("Registering self signed up via google/fb user in database..")
		ri := RegisterUserInputData{
			DynamodbClient: dynamodbClient,
			UserTableName:  userTableName,
			RegisterUserInputData: &RegisterUserInput{
				ID:        cognitoEvent.UserName,
				Email:     cognitoEvent.Request.UserAttributes.Email,
				FirstName: cognitoEvent.Request.UserAttributes.FirstName,
				LastName:  cognitoEvent.Request.UserAttributes.LastName,
			},
		}

		err := RegisterUser(&ri)
		if err != nil {
			str := "Failed to register user: %v\n"
			errorLog.Printf(str, err)
			return output, fmt.Errorf(str, err)
		}
	}

	return output, nil
}

func main() {
	lambda.Start(handler)
}
