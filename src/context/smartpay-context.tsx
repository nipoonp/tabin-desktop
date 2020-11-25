import React, { useEffect } from "react";
import axios from "axios";
import { useUser } from "./user-context";
import { useRegister } from "./register-context";
// ******************************************************************************
// The code below will handle the SmartConnect API endpoint communication.
// SmartConnect API endpoints are CORS-enabled, so the calls can be made from the front-end.
// ******************************************************************************

// This base URL points to the DEV environment, against which all development and testing should be done.
// When deploying your app to production, make sure to remember to have a way to change this URL to use PROD endpoints.
// const _baseUrl = "https://api-dev.smart-connect.cloud/POS";

// Register ID. *Must* be unique across *all* of your customers using your POS. The same ID must be sent for both
// pairing and transaction requests. A UUID is generally convenient here, though it doesn't need to be a UUID.
// const _posRegisterId = "6bd3bf1c-11cb-42ae-92c7-46ac39680166";

// The name of the register. Only used during pairing. This will be displayed on the device itself (to easily
// visually identify where it is paired to).
// const _posRegisterName = "Register 1";

// The merchant name of your customer. *Must* be consistent between pairing and transaction requests.
// Side note: If the customer chooses to change their business name, a new pairing request needs to be issued.
// const _posBusinessName = "Demo Shop";

// The name of your POS application. *Must* be consistent between pairing and transaction requests.
// const _posVendorName = "Test POS";

// This "enum" will be used to return back the final transaction outcome after polling is complete.
//
// The transaction outcome is generally decided by two parameters inside the result JSON: TransactionResult and data.Result.
//
// *TransactionResult* is the actual outcome of the transaction.
// Possible values are: OK-ACCEPTED, OK-DECLINED, OK-UNAVAILABLE, OK-DELAYED, CANCELLED, FAILED, FAILED-INTERFACE
//
// *Result* indicates if the function was performed successfully (a Declined outcome is also a function performed successfully).
// Possible values are: OK, CANCELLED, DELAYED-TRANSACTION, FAILED, FAILED-INTERFACE.
//
// For a full reference on these parameters, see: http://www.smartpayinvestor.com/smartconnect-api-integration-guide/
//
// From the point of view of the POS, TransactionResult is the main determinant of the outcome of the transaction.
// Result can be used as a complementary field, the major use being to distinguish Cancelled transactions between
// the user pressing Cancel on the device, from the device being offline.
//
// The scenarios below capture the outcomes we'd want to handle on the interface.
export enum SmartpayTransactionOutcome {
  Accepted, // TransactionResult = "OK-ACCEPTED"
  Declined, // TransactionResult = "OK-DECLINED"
  Cancelled, // TransactionResult = "CANCELLED", Result != "FAILED-INTERFACE"
  DeviceOffline, // TransactionResult = "CANCELLED", Result = "FAILED-INTERFACE"
  Failed, // Everything else
}

type ContextProps = {
  sendParingRequest: (pairingCode: string) => Promise<void>;
  createTransaction: (
    amount: number,
    transactionType: string
  ) => Promise<string>;
  pollForOutcome: (
    pollingUrl: string,
    delayed: () => void
  ) => Promise<SmartpayTransactionOutcome>;
};

const SmartpayContext = React.createContext<ContextProps>({
  sendParingRequest: (pairingCode: string) => {
    return new Promise(() => {
      console.log("");
    });
  },
  createTransaction: (amount: number, transactionType: string) => {
    return new Promise(() => {
      console.log("");
    });
  },
  pollForOutcome: (pollingUrl: string, delayed: () => void) => {
    return new Promise(() => {
      console.log("");
    });
  },
});

const SmartpayProvider = (props: { children: React.ReactNode }) => {
  const { user } = useUser();
  const {register} = useRegister();

  const _baseUrl: string = "https://api.smart-connect.cloud/POS";
  let _posRegisterId: string | null = register ? register.id : null;
  const _posRegisterName: string | null = register ? register.name : null;
  let _posBusinessName: string;
  const _posVendorName: string = "Tabin";

  useEffect(() => {
    if (user && user.restaurants.items.length > 0) {
      _posBusinessName = user.restaurants.items[0].name;
    }
  }, [user]);

  // ======================================================
  // PAIRING REQUEST
  //
  // Parameters:
  // - pairingCode (required) - The code as displayed on the device, and inputted by the user
  //
  // Returns:
  // - a JS Promise with the outcome (resolve, no object passed back / reject, error message passed back)
  // ======================================================
  const sendParingRequest = (pairingCode: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (!pairingCode) {
        reject("A pairing code has to be supplied.");
        return;
      }

      if (!_posRegisterId) {
        reject("A posRegisterId has to be supplied.");
        return;
      }

      if (!_posRegisterName) {
        reject("A posRegisterName has to be supplied.");
        return;
      }
      
      const pairingEndpoint = _baseUrl + "/Pairing/" + pairingCode;

      const params = new URLSearchParams();
      params.append("POSRegisterID", _posRegisterId);
      params.append("POSRegisterName", _posRegisterName);
      params.append("POSBusinessName", _posBusinessName);
      params.append("POSVendorName", _posVendorName);

      console.log("Sending pairing request to: " + pairingEndpoint);
      console.log("Pairing parameters: " + params.toString());

      try {
        // Note that a PUT is required. Any other method will return with a 404 Not Found.
        let response = await axios.put(pairingEndpoint, params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        });

        // success function invoked when 2xx OK is received
        try {
          console.log(
            `Pairing response received (${response.status}) ${response.data.result}`
          );

          // Trust, but verify
          if (response.status == 200) {
            // No object passed back
            resolve();
            return;
          } else {
            // We don't really expect anything other than 200 in here, but you never know...
            reject("Invalid status code received");
            return;
          }
        } catch (error) {
          // Catch code errors (parsing failure, etc.)
          reject(error);
        }
      } catch (error) {
        //  error function invoked when anything other than 2xx OK is received
        console.log(
          `Pairing response received (${error.response.status}) ${error.response.data.result}`
        );

        // Generally, if it's an "expected" error (e.g. invalid/expired pairing code), a 4xx will be returned
        // and a JSON description of the error provided (except for 404 Not Found). For example:
        //
        // { "error": "Invalid Pairing Code. Please make sure you entered the code correctly" } (400 Bad Request)
        //
        // We will only fall back to errorThrown if this is not present (i.e. if a 5xx server error happens instead).
        // errorThrown will be a generic "Internal Server Error" etc. as per the status code.
        let errorThrow =
          error.response.data && error.response.data.error
            ? error.response.data.error
            : "Internal Server Error";

        // For the purpose of this example, we will treat all errors "equally" and just surface the error
        // message back, however you may wish to at least differentiate between 4xx and 5xx errors in a
        // production implementation (i.e. errors that have a message and can be caught versus call/server failure).
        reject(errorThrow);
      }
    });
  };

  // ======================================================
  // CREATE TRANSACTION
  //
  // Parameters:
  // - amount (required) - The amount in cents ($1.99 should be supplied as 199). Currency is not required,
  //     will fall back to the default currency on the device
  // - transactionType (required) - The function on the device to invoke (e.g. Card.Purchase, Card.Refund, etc.)
  //
  // Returns:
  // - a JS Promise with the outcome:
  //     - resolve(string) - the string will contain the polling url
  //     - reject(string) - the string will contain the error message
  // ======================================================
  const createTransaction = (
    amount: number,
    transactionType: string
  ): Promise<string> => {
    // To get the transaction outcome, at least two asynchronous requests will be needed.
    // The first request will POST the transaction parameters to the endpoint, and obtain a
    // polling URL. The client will then continue polling (executing GET against that URL)
    // until the actual final outcome of the transaction is received.

    // This function will return that polling URL via the resolve function.

    return new Promise((resolve, reject) => {
      if (!amount) {
        reject("The amount has to be supplied");
        return;
      } else if (amount == 0) {
        reject("The amount must be greater than 0");
        return;
      } else if (!transactionType) {
        reject("The transactionType has to be supplied");
        return;
        // Will not perform additional validation on TransactionType here, the server will reject it
        // in case it is invalid.
      }

      if (!_posRegisterId) {
        reject("A posRegisterId has to be supplied.");
        return;
      }

      if (!_posRegisterName) {
        reject("A posRegisterName has to be supplied.");
        return;
      }
      

      const transactionEndpoint = _baseUrl + "/Transaction";

      // Some transaction types allow for additional fields (e.g. Card.PurchasePlusCash will require the
      // AmountCash value to be supplied as well), however for simplicity reasons those will be omitted here.
      // For the full API reference, see: http://www.smartpayinvestor.com/smartconnect-api-integration-guide/
      const params = new URLSearchParams();
      params.append("POSRegisterID", _posRegisterId);
      params.append("POSBusinessName", _posBusinessName);
      params.append("POSVendorName", _posVendorName);
      params.append("TransactionMode", "ASYNC");
      params.append("TransactionType", transactionType);
      params.append("AmountTotal", String(amount));

      console.log(
        "Sending transaction POST request to: " + transactionEndpoint
      );
      console.log("Transaction parameters: " + params.toString());

      // Note that a POST is required. Any other method will return with a 404 Not Found.
      axios
        .post(transactionEndpoint, params, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        })
        .then((response) => {
          try {
            console.log(
              `Transaction POST response received (${response.status}) ${response.data.result}`
            );

            // Trust, but verify
            if (response.status == 200) {
              // Extract the polling URL
              let res = response.data;

              if (res.data && res.data.PollingUrl) {
                // return the polling URL
                resolve(res.data.PollingUrl);
                return;
              } else {
                // Something's not quite right here - not very likely to happen, but you never know...
                reject("Returned 200 but Polling URL missing");
                return;
              }
            } else {
              // We don't really expect anything other than 200 in here, but you never know...
              reject("Invalid status code received");
              return;
            }
          } catch (error) {
            // Catch code errors (parsing failure, etc.)
            reject(error);
          }
        })
        .catch((error) => {
          // error function invoked when anything other than 2xx OK is received
          console.log(
            `Transaction POST response received (${error.response.status}) ${error.response.data.result}`
          );

          // Generally, if it's an "expected" error (e.g. no device is paired), a 4xx will be returned
          // and a JSON description of the error provided (except for 404 Not Found). For example:
          //
          // { "error": "This register is not paired to a device, please pair it first." } (400 Bad Request)
          // or
          // { "error": "device is busy" } (429 Too Many Requests)
          //
          // We will only fall back to errorThrown if this is not present (i.e. if a 5xx server error happens instead).
          // errorThrown will be a generic "Internal Server Error" etc. as per the status code.
          let errorThrow =
            error.response.data && error.response.data.error
              ? error.response.data.error
              : "Internal Server Error";

          // For the purpose of this example, we will treat all errors "equally" and just surface the error
          // message back, however you may wish to at least differentiate between 4xx and 5xx errors in a
          // production implementation (i.e. errors that have a message and can be caught versus call/server failure).
          reject(errorThrow);
        });
    });
  };

  // =====================================================
  // POLL FOR THE FINAL OUTCOME OF THE TRANSACTION
  //
  // Parameters:
  // - pollingUrl (required) - URL obtained through the createTransaction() function
  // - delayed (optional) - the function to invoke if the transaction enters a "Delayed" state
  //     See the API reference for information on the Delayed state.
  //
  // Returns:
  // - a JS Promise with the outcome:
  //     - resolve(SmartpayTransactionOutcome, responseData) - one of the outcomes to handle on the "interface" and
  //       the response data from the jqXHR object
  //     - reject(string) - the string will contain the error message
  // =====================================================
  const pollForOutcome = (
    pollingUrl: string,
    delayed: () => void
  ): Promise<SmartpayTransactionOutcome> => {
    // Polling interval on the PROD server will be rate limited to 2 seconds.

    // It's a bad idea to let the polling run indefinitely, so will set an overall timeout to
    // 10 minutes. Generally, no customer will wait for 10 minutes for an outcome, so ideally
    // in production code there would be a way to interrupt the polling and finish the transaction
    // manually (in case the device got completely bricked or something went wrong the API server).

    // Generally, if the device temporarily dies (temporary Internet outage, power loss, etc) - it will
    // upload the result to the API server the moment it comes back online.

    const interval = 2 * 1000; // 2 seconds
    const timeout = 10 * 60 * 1000; // 10 minutes

    const endTime = Number(new Date()) + timeout;

    var checkCondition = async (resolve: any, reject: any) => {
      if (!pollingUrl) {
        reject("Polling URL needs to be submitted");
        return;
      }

      console.log("Polling for outcome: " + pollingUrl);

      try {
        // Note that a GET is required. Any other method will return with a 404 Not Found.
        let response = await axios.get(pollingUrl, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          },
        });

        // Gets called after *either* success or error are called
        try {
          console.log(
            `Transaction GET response received (${response.status}) ${response.data.result}`
          );

          let transactionComplete = false;
          let transactionOutcome;

          if (response.status == 200) {
            let res = response.data;

            if (res && res.data) {
              let transactionStatus = res.transactionStatus;
              let transactionResult = res.data.TransactionResult;
              let result = res.data.Result;

              if (transactionStatus == "COMPLETED") {
                // Transaction is concluded, no need to continue polling
                transactionComplete = true;

                // Determine the outcome of the transaction
                if (transactionResult == "OK-ACCEPTED") {
                  transactionOutcome = SmartpayTransactionOutcome.Accepted;
                } else if (transactionResult == "OK-DECLINED") {
                  transactionOutcome = SmartpayTransactionOutcome.Declined;
                } else if (
                  transactionResult == "CANCELLED" &&
                  result != "FAILED-INTERFACE"
                ) {
                  transactionOutcome = SmartpayTransactionOutcome.Cancelled;
                } else if (
                  transactionResult == "CANCELLED" &&
                  result == "FAILED-INTERFACE"
                ) {
                  transactionOutcome = SmartpayTransactionOutcome.DeviceOffline;
                } else {
                  // Everything else is pretty-much a failed outcome
                  transactionOutcome = SmartpayTransactionOutcome.Failed;
                }
              } else if (
                transactionStatus == "PENDING" &&
                transactionResult == "OK-DELAYED" &&
                delayed
              ) {
                // Transaction still not done, but server reporting it's taking longer than usual
                // Invoke the delayed function - POS may choose to display a visual indication to the user
                // (in case e.g. the device lost connectivity and is not able to upload the outcome)
                delayed();

                // Will still continue to poll...
              }
            } else {
              // Something's not quite right here - not very likely to happen, but you never know...
              reject("Returned 200 but data structure not as expected");
              return;
            }
          } else {
            // We do not expect the server to return a 4xx error for a "known" reason at this stage
            // If the request has failed, it's most likely with something on the infrastructure level
            // (e.g. Internet down on client or server offline/unreachable)

            // We will silently ignore this and continue polling
            console.log("Ignoring failed request...");
          }

          console.log(transactionComplete, transactionOutcome);

          // Determine if we should continue with the recursion (polling) or not
          if (transactionComplete && transactionOutcome != null) {
            // All done!
            // resolve(transactionOutcome, response.data.result);
            resolve(transactionOutcome);
            return;
          } else if (Number(new Date()) < endTime) {
            // If the condition isn't met but the timeout hasn't elapsed, go again
            setTimeout(checkCondition, interval, resolve, reject);
            return;
          } else {
            // Didn't match and too much time, reject!
            reject("Polling timed out");
            return;
          }
        } catch (error) {
          // Catch code errors (parsing failure, etc.)
          reject(error);
        }
      } catch (error) {
        // Catch code errors (parsing failure, etc.)
        reject(error);
      }
    };

    return new Promise(checkCondition);
  };

  return (
    <SmartpayContext.Provider
      value={{
        sendParingRequest: sendParingRequest,
        createTransaction: createTransaction,
        pollForOutcome: pollForOutcome,
      }}
      children={props.children}
    />
  );
};

const useSmartpay = () => {
  const context = React.useContext(SmartpayContext);
  if (context === undefined) {
    throw new Error(`useSmartpay must be used within a SmartpayProvider`);
  }
  return context;
};

export { SmartpayProvider, useSmartpay };
