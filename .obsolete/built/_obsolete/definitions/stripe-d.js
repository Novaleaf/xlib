"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *  helper function that will generate a user friendly debug POJO based on the error returned by stripe.
 * @param error
 */
function generateUserDebugInfo(error) {
    const toReturn = {
        name: error.name,
        statusCode: error.statusCode,
        type: error.rawType,
        param: error.param,
        message: error.message,
        code: error.code,
        details: error.detail,
        charge: undefined,
        decline_code: undefined,
    };
    if (toReturn.details == null) {
        toReturn.details = "";
    }
    if (error.raw == null) {
        //nothing more to do
        return toReturn;
    }
    toReturn.charge = error.raw.charge;
    if (error.raw.decline_code == null) {
        //nothing more to do
        return toReturn;
    }
    toReturn.decline_code = error.raw.decline_code;
    let declineDetails;
    switch (error.raw.decline_code) {
        case "approve_with_id":
            declineDetails = "The payment cannot be authorized	The payment should be attempted again.If it still cannot be processed, the customer needs to contact their bank.";
            break;
        case "call_issuer":
            declineDetails = "The card has been declined for an unknown reason	The customer needs to contact their bank for more information.";
            break;
        case "card_not_supported":
            declineDetails = "The card does not support this type of purchase	The customer needs to contact their bank to make sure their card can be used to make this type of purchase.";
            break;
        case "card_velocity_exceeded":
            declineDetails = "The customer has exceeded the balance or credit limit available on their card.The customer should contact their bank for more information.";
            break;
        case "currency_not_supported":
            declineDetails = "The card does not support the specified currency.The customer needs check with the issuer that the card can be used for the type of currency specified.";
            break;
        case "do_not_honor":
            declineDetails = "The card has been declined for an unknown reason	The customer needs to contact their bank for more information.";
            break;
        case "do_not_try_again":
            declineDetails = "The card has been declined for an unknown reason	The customer should contact their bank for more information.";
            break;
        case "fraudulent":
            declineDetails = "The payment has been declined as the issuer suspects it is fraudulent	The customer should contact their bank for more information.";
            break;
        case "insufficient_funds":
            declineDetails = "The card has insufficient funds to complete the purchase	The customer should use an alternative payment method.";
            break;
        case "invalid_account":
            declineDetails = "The card, or account the card is connected to, is invalid	The customer needs to contact their bank to check that the card is working correctly.";
            break;
        case "invalid_amount":
            declineDetails = "The payment amount is invalid, or exceeds the amount that is allowed	If the amount appears to be correct, the customer needs to check with their bank that they can make purchases of that amount.";
            break;
        case "invalid_pin":
            declineDetails = "The PIN entered is incorrect.This decline code only applies to payments made with a card reader.The customer should try again using the correct PIN.";
            break;
        case "issuer_not_available":
            declineDetails = "The card issuer could not be reached, so the payment could not be authorized	The payment should be attempted again.If it still cannot be processed, the customer needs to contact their bank.";
            break;
        //case "lost_card": bankDeclineReason = "The payment has been declined because the card is reported lost	The specific reason for the decline should not be reported to the customer.Instead, it needs to be presented as a generic decline.";
        //	break;
        case "new_account_information_available":
            declineDetails = "The card, or account the card is connected to, is invalid	The customer needs to contact their bank for more information.";
            break;
        case "no_action_taken":
            declineDetails = "The card has been declined for an unknown reason	The customer should contact their bank for more information.";
            break;
        case "not_permitted":
            declineDetails = "The payment is not permitted	The customer needs to contact their bank for more information.";
            break;
        case "pickup_card":
            declineDetails = "The card cannot be used to make this payment (it is possible it has been reported lost or stolen)	The customer needs to contact their bank for more information.";
            break;
        case "reenter_transaction":
            declineDetails = "The payment could not be processed by the issuer for an unknown reason.The payment should be attempted again.If it still cannot be processed, the customer needs to contact their bank.";
            break;
        case "restricted_card":
            declineDetails = "The card cannot be used to make this payment (it is possible it has been reported lost or stolen)	The customer needs to contact their bank for more information.";
            break;
        case "revocation_of_all_authorizations":
            declineDetails = "The card has been declined for an unknown reason	The customer should contact their bank for more information.";
            break;
        case "revocation_of_authorization":
            declineDetails = "The card has been declined for an unknown reason	The customer should contact their bank for more information.";
            break;
        case "security_violation":
            declineDetails = "The card has been declined for an unknown reason	The customer needs to contact their bank for more information.";
            break;
        case "service_not_allowed":
            declineDetails = "The card has been declined for an unknown reason	The customer should contact their bank for more information.";
            break;
        //case "stolen_card": bankDeclineReason = "The payment has been declined because the card is reported stolen	The specific reason for the decline should not be reported to the customer.Instead, it needs to be presented as a generic decline.";
        //	break;
        case "stop_payment_order":
            declineDetails = "The card has been declined for an unknown reason	The customer should contact their bank for more information.";
            break;
        case "testmode_decline":
            declineDetails = "A Stripe test card number was used	A genuine card must be used to make a payment.";
            break;
        case "transaction_not_allowed":
            declineDetails = "The card has been declined for an unknown reason	The customer needs to contact their bank for more information.";
            break;
        case "try_again_later":
            declineDetails = "The card has been declined for an unknown reason	Ask the customer to attempt the payment again.If subsequent payments are declined, the customer should contact their bank for more information.";
            break;
        case "withdrawal_count_limit_exceeded":
            declineDetails = "The customer has exceeded the balance or credit limit available on their card.The customer should use an alternative payment method.";
            break;
        case "lost_card":
        case "stolen_card":
        case "generic_decline":
        default:
            //in case lost or stolen, need to replace the decline code with "generic_decline"
            toReturn["decline_code"] = "generic_decline";
            declineDetails = "The card has been declined for an unknown reason	The customer needs to contact their bank for more information.";
            break;
    }
    toReturn.details += " " + declineDetails;
    return toReturn;
}
exports.generateUserDebugInfo = generateUserDebugInfo;
//# sourceMappingURL=stripe-d.js.map