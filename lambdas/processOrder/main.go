package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/sns"

	// "github.com/joho/godotenv"

	// "github.com/mitchellh/mapstructure"

	"github.com/aws/aws-sdk-go-v2/aws/external"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/dynamodbattribute"
	"github.com/google/uuid"
)

// Service is the main entry point into using this package.
type Service struct {
	AWSAccessKey         string
	AWSAccessSecret      string
	AWSSNSApplicationARN string
	AWSRegion            string
}

// Data is the data of the sending pushnotification.
type Data struct {
	Alert *string     `json:"alert,omitempty"`
	Data  interface{} `json:"custom_data"`
	Title *string     `json:"title,omitempty"`
	Body  *string     `json:"body,omitempty"`
	Sound *string     `json:"sound,omitempty"`
	Image *string     `json:"image,omitempty"`
	Icon  *string     `json:"icon,omitempty"`
	Color *string     `json:"color,omitempty"`
	Badge *int        `json:"badge,omitempty"`
}

// Send sends a push notification
func (s *Service) Send(deviceToken string, data *Data) (err error) {

	svc := sns.New(session.New(&aws.Config{
		Credentials: credentials.NewStaticCredentials(s.AWSAccessKey, s.AWSAccessSecret, ""),
		Region:      aws.String(s.AWSRegion),
	}))

	resp, err := svc.CreatePlatformEndpoint(&sns.CreatePlatformEndpointInput{
		PlatformApplicationArn: aws.String(s.AWSSNSApplicationARN),
		Token:                  aws.String(deviceToken),
	})
	if err != nil {
		return
	}

	m, err := newMessageJSON(data)
	if err != nil {
		return
	}

	input := &sns.PublishInput{
		Message:          aws.String(m),
		MessageStructure: aws.String("json"),
		TargetArn:        aws.String(*resp.EndpointArn),
	}
	_, err = svc.Publish(input)
	return
}

type message struct {
	// APNS        string `json:"APNS"`
	// APNSSandbox string `json:"APNS_SANDBOX"`
	// Default     string `json:"default"`
	GCM string `json:"GCM"`
}

// type iosPush struct {
// 	APS Data `json:"aps"`
// }

type gcmPush struct {
	Message *string     `json:"message,omitempty"`
	Custom  interface{} `json:"custom"`
}

type gcmNotificationPush struct {
	Title *string `json:"title,omitempty"`
	Body  *string `json:"body,omitempty"`
	Sound *string `json:"sound,omitempty"`
	Image *string `json:"image,omitempty"`
	Icon  *string `json:"icon,omitempty"`
	Color *string `json:"color,omitempty"`
	Badge *int    `json:"badge,omitempty"`
}

type gcmPushWrapper struct {
	Notification gcmNotificationPush `json:"notification"`
	Data         gcmPush             `json:"data"`
}

func newMessageJSON(data *Data) (m string, err error) {
	// b, err := json.Marshal(iosPush{
	// 	APS: *data,
	// })
	// if err != nil {
	// 	return
	// }
	// payload := string(b)

	b, err := json.Marshal(gcmPushWrapper{
		Notification: gcmNotificationPush{
			Title: data.Title,
			Body:  data.Body,
			Sound: data.Sound,
			Image: data.Image,
			Icon:  data.Icon,
			Color: data.Color,
			Badge: data.Badge,
		},
		Data: gcmPush{
			Message: data.Alert,
			Custom:  data.Data,
		},
	})
	if err != nil {
		return
	}
	gcm := string(b)

	pushData, err := json.Marshal(message{
		// Default:     *data.Alert,
		// APNS:        payload,
		// APNSSandbox: payload,
		GCM: gcm,
	})
	if err != nil {
		return
	}
	m = string(pushData)
	return
}

type output interface{}

type MyEvent struct {
	OrderUserId       string         `json:"orderUserId"`
	OrderRestaurantId string         `json:"orderRestaurantId"`
	Notes             string         `json:"notes,omitempty"`
	Products          []OrderProduct `json:"products,omitempty"`
	Type              string         `json:"type"`
	Number            string         `json:"number"`
	Table             string         `json:"table,omitempty"`
	Total             int            `json:"total"`
	Paid              bool           `json:"paid"`
	RegisterId        string         `json:"registerId,omitempty"`
}

type MyFields struct {
	ID                string         `json:"id"`
	OrderUserId       string         `json:"orderUserId"`
	OrderRestaurantId string         `json:"orderRestaurantId"`
	Notes             string         `json:"notes,omitempty"`
	Products          []OrderProduct `json:"products,omitempty"`
	Status            string         `json:"status"`
	Type              string         `json:"type"`
	Number            string         `json:"number"`
	Table             string         `json:"table,omitempty"`
	RegisterId        string         `json:"registerId,omitempty"`
	PlacedAt          string         `json:"placedAt"`
	PlacedAtUtc       string         `json:"placedAtUtc"`
	Total             int            `json:"total,omitempty"`
	Paid              bool           `json:"paid"`
	CreatedAt         string         `json:"createdAt"`
	UpdatedAt         string         `json:"updatedAt"`
	Owner             string         `json:"owner"`
}

type RestaurantDeviceEndpoint struct {
	DeviceEndpoint string `json:"deviceEndpoint"`
}

type OrderProduct struct {
	ID             string               `json:"id"`
	Name           string               `json:"name"`
	Price          int                  `json:"price"`
	Quantity       int                  `json:"quantity"`
	Notes          string               `json:"notes,omitempty"`
	ModifierGroups []OrderModifierGroup `json:"modifierGroups,omitempty"`
}

type OrderModifierGroup struct {
	ID              string          `json:"id"`
	Name            string          `json:"name"`
	HideForCustomer bool            `json:"hideForCustomer,omitempty"`
	Modifiers       []OrderModifier `json:"modifiers,omitempty"`
}

type OrderModifier struct {
	ID                  string `json:"id"`
	Name                string `json:"name"`
	Price               int    `json:"price"`
	PreSelectedQuantity int    `json:"preSelectedQuantity,omitempty"`
	Quantity            int    `json:"quantity"`
}

func getRestaurantDeviceEndpoint(dynamodbClient *dynamodb.Client, tableName string, orderRestaurantID string) (deviceEndpoint string, err error) {
	input := &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]dynamodb.AttributeValue{
			"id": {
				S: aws.String(orderRestaurantID),
			},
		},
	}

	req := dynamodbClient.GetItemRequest(input)
	res, err := req.Send(context.Background())
	if err != nil {
		return "", err
	}

	restaurant := RestaurantDeviceEndpoint{}

	err = dynamodbattribute.UnmarshalMap(res.GetItemOutput.Item, &restaurant)
	if err != nil {
		return "", fmt.Errorf("Failed to unmarshal Device Endpoint, %v", err)
	}

	return restaurant.DeviceEndpoint, nil
}

func getLocalTime() time.Time {
	// same thing time.Now().UTC().Format("2006-01-02T15:04:05Z")
	// nowUtc := time.Now().Format(time.RFC3339)

	nowUtc := time.Now().UTC()

	local := nowUtc
	location, err := time.LoadLocation("Pacific/Auckland")
	if err == nil {
		local = local.In(location)
	}

	return local
}

func getFields(OrderInput MyEvent) MyFields {
	now := time.Now().Format(time.RFC3339)
	newUUID := uuid.New()

	local := getLocalTime()
	localInISO8601 := local.Format("2006-01-02T15:04:05")

	myFields := MyFields{
		ID:                newUUID.String(),
		OrderUserId:       OrderInput.OrderUserId,
		OrderRestaurantId: OrderInput.OrderRestaurantId,
		Notes:             OrderInput.Notes,
		Products:          OrderInput.Products,
		Status:            "NEW",
		Type:              OrderInput.Type,
		Number:            OrderInput.Number,
		Table:             OrderInput.Table,
		RegisterId:        OrderInput.RegisterId,
		PlacedAt:          localInISO8601,
		PlacedAtUtc:       now,
		Total:             OrderInput.Total,
		Paid:              OrderInput.Paid,
		CreatedAt:         now,
		UpdatedAt:         now,
		Owner:             OrderInput.OrderUserId,
	}

	fmt.Println(myFields)

	return myFields
}

func CreateOrder(dynamodbClient *dynamodb.Client, OrderTableName string, myFields MyFields) (result string, err error) {
	dynamoItem, err := dynamodbattribute.MarshalMap(myFields)
	if err != nil {
		return "", err
	}

	statusPlacedAtString := myFields.Status + "#" + myFields.PlacedAt
	statusPlacedAt, err := dynamodbattribute.Marshal(statusPlacedAtString)
	if err != nil {
		return "", err
	}

	dynamoItem["status#placedAt"] = *statusPlacedAt

	// condExpr := "attribute_not_exists(#i)"
	// exprAttrNames := map[string]string{
	// 	"#i": "id",
	// }

	fmt.Println("dynamoItem", dynamoItem)

	input := dynamodb.PutItemInput{
		TableName: aws.String(OrderTableName),
		Item:      dynamoItem,
		// ConditionExpression:      aws.String(condExpr),
		// ExpressionAttributeNames: exprAttrNames,
	}

	fmt.Println("before....")

	req := dynamodbClient.PutItemRequest(&input)
	_, err = req.Send(context.Background())
	if err != nil {
		return "", err
	}

	fmt.Println("Got req: ", req)

	// err = dynamodbattribute.UnmarshalMap(res.Attributes, "")
	// if err != nil {
	// 	return "", err
	// }

	return "", nil
}

type event map[string]interface{}

func handler(request event) (output, error) {
	// func handler(ctx context.Context, event MyEvent) (output, error) {
	// func main() {
	// if err := godotenv.Load(); err != nil {
	// 	log.Fatal(err)
	// }

	// DebugEvent(event)

	// convert map to json
	jsonString, err := json.Marshal(request["input"])
	if err != nil {
		return "", err
	}

	// convert json to struct
	inputData := MyEvent{}
	json.Unmarshal(jsonString, &inputData)

	fmt.Println("Got input: ", inputData)
	fmt.Println("Getting endpoint for restaurantID: ", inputData.OrderRestaurantId)

	cfg, err := external.LoadDefaultAWSConfig()
	if err != nil {
		panic("failed to load config, " + err.Error())
	}
	dynamodbClient := dynamodb.New(cfg)

	deviceEndpoint, err := getRestaurantDeviceEndpoint(dynamodbClient, os.Getenv("RESTAURANT_TABLE_NAME"), inputData.OrderRestaurantId)
	if err != nil {
		// errorLog.Printf("Failed to get restaurant device endpoint: %v\n", err)
		return nil, fmt.Errorf("Failed to get restaurant device endpoint: %v\n", err)
	}

	fmt.Println("Sending notification to endpoint: ", deviceEndpoint)

	push := Service{
		AWSAccessKey:         os.Getenv("AWSAccessKey"),
		AWSAccessSecret:      os.Getenv("AWSAccessSecret"),
		AWSSNSApplicationARN: os.Getenv("AWSSNSApplicationARN"),
		AWSRegion:            os.Getenv("AWSRegion"),
	}

	fields := getFields(inputData)

	fieldsJson, err := json.Marshal(fields)
	if err != nil {
		panic(err)
	}

	local := getLocalTime()
	readableLocalFormat := local.Format("01/02/06 3:04 PM")

	currentTimeString := "New received at " + readableLocalFormat

	err = push.Send(deviceEndpoint, &Data{
		Alert: aws.String(string(fieldsJson)),
		Title: aws.String("New Order!"),
		Body:  aws.String(currentTimeString),
		Sound: aws.String("default"),
		Image: aws.String("https://cdn.mos.cms.futurecdn.net/VSy6kJDNq2pSXsCzb6cvYF-1024-80.jpg"),
		Icon:  aws.String("https://cdn.mos.cms.futurecdn.net/VSy6kJDNq2pSXsCzb6cvYF-1024-80.jpg"),
		Color: aws.String("#FAAF3A"),
		Badge: aws.Int(1),
	})
	if err != nil {
		log.Fatal(err)
	}

	_, err = CreateOrder(dynamodbClient, os.Getenv("ORDER_TABLE_NAME"), fields)
	if err != nil {
		// errorLog.Printf("Failed to get restaurant device endpoint: %v\n", err)
		return nil, fmt.Errorf("Failed put order into order table: %v\n", err)
	}

	return deviceEndpoint, nil
}

func main() {
	lambda.Start(handler)
}
