

export interface StripeStatic {
    (apiKey: string): StripeInstance;
}



export interface IMetadata {
    [key: string]: string
}
interface IList<T> {
    /**
     * Value is 'list'
     */
    object: string;

    data: Array<T>;

    has_more: boolean;

    /**
     * The URL where this list can be accessed.
     */
    url: string;

    /**
     * The total number of items available. This value is not included by default, 
     * but you can request it by specifying ?include[]=total_count
     */
    total_count: number;
}

/**
 * You can store multiple cards on a customer in order to charge the customer later. You 
 * can also store multiple debit cards on a recipient in order to transfer to those cards later.
 */
export interface ICard {
    /**
     * ID of card (used in conjunction with a customer or recipient ID)
     */
    id: string;

    /**
     * Value is 'card'
     */
    object: string;

    /**
     * The card number
     */
    "number": number;

    /**
     * Card brand. Can be Visa, American Express, MasterCard, Discover, JCB, Diners Club, or Unknown.
     */
    brand: string;
    exp_month: number;
    exp_year: number;

    /**
     * Card funding type. Can be credit, debit, prepaid, or unknown
     */
    funding: string;
    last4: string;
    address_city: string;

    /**
     * Billing address country, if provided when creating card
     */
    address_country: string;
    address_line1: string;
    /**
     * If address_line1 was provided, results of the check: pass, fail, unavailable, or unchecked.
     */
    address_line1_check: string;
    address_line2: string;
    address_state: string;
    address_zip: string;

    /**
     * If address_zip was provided, results of the check: pass, fail, unavailable, or unchecked.
     */
    address_zip_check: string;

    /**
     * Two-letter ISO code representing the country of the card. You could use this 
     * attribute to get a sense of the international breakdown of cards you’ve collected.
     */
    country: string;

    /**
     * The customer that this card belongs to. This attribute will not be in the card object 
     * if the card belongs to a recipient instead.
     */
    customer: string;

    /**
     * If a CVC was provided, results of the check: pass, fail, unavailable, or unchecked
     */
    cvc_check: string;

    /**
     * (For Apple Pay integrations only.) The last four digits of the device account number.
     */
    dynamic_last4: string;

    /**
     * Cardholder name
     */
    name: string;

    /**
     * The recipient that this card belongs to. This attribute will not be in the card object if 
     * the card belongs to a customer instead.
     */
    recipient: string;

    /**
     * Uniquely identifies this particular card number. You can use this attribute to check 
     * whether two customers who’ve signed up with you are using the same card number, for example.
     */
    fingerprint: string;
}


interface IRefund {
    id: string;

    /**
     * Value is 'list'
     */
    object: string;

    /**
     * Amount reversed in cents.
     */
    amount: number;

    created: number;

    /**
     * Three-letter ISO currency code representing the currency in which the charge was made.
     */
    currency: string;

    /**
     * Balance transaction that describes the impact of this reversal on your account balance.
     */
    balance_transaction: string;

    /**
     * ID of the charge that was refunded.
     */
    charge: string;

    metadata: IMetadata;

    /**
     * Reason for the refund. If set, possible values are duplicate, fraudulent, and requested_by_customer.
     */
    reason: string;

    /**
     * This is the transaction number that appears on email receipts sent for this refund.
     */
    receipt_number: string;

    description: string;
}

/**
 * A dispute occurs when a customer questions your charge with their bank or credit card company. 
 * When a customer disputes your charge, you're given the opportunity to respond to the dispute with 
 * evidence that shows the charge is legitimate. You can find more information about the dispute process 
 * in our disputes FAQ: https://stripe.com/help/disputes
 */
interface IDispute {
    /**
     * Valud is 'dispute'
     */
    object: string;
    livemode: boolean;

    /**
     * Disputed amount. Usually the amount of the charge, but can differ (usually because of currency 
     * fluctuation or because only part of the order is disputed).
     */
    amount: number;

    /**
     * ID of the charge that was disputed
     */
    charge: string;

    /**
     * Date dispute was opened
     */
    created: number;

    /**
     * Three-letter ISO currency code representing the currency of the amount that was disputed.
     */
    currency: string;

    /**
     * Reason given by cardholder for dispute. Possible values are duplicate, fraudulent, subscription_canceled, 
     * product_unacceptable, product_not_received, unrecognized, credit_not_processed, general.
     * Read more about dispute reasons: https://stripe.com/help/disputes#reasons
     */
    reason: string;

    /**
     * Current status of dispute. Possible values are warning_needs_response, warning_under_review, warning_closed, 
     * needs_response, response_disabled, under_review, charge_refunded, won, lost.
     */
    status: string;

    /**
     * List of zero, one, or two balance transactions that show funds withdrawn and reinstated to your 
     * Stripe account as a result of this dispute.
     */
    balance_transactions: Array<IBalanceTransaction>;

    /**
     * Evidence provided to respond to a dispute. Updating any field in the hash will submit all fields in the hash for review.
     */
    evidence: IDisputeEvidence;

    /**
     * Information about the evidence submission.
     */
    evidence_details?: {
        /**
         * Whether or not evidence has been saved for this dispute.
         */
        has_evidence: boolean;

        /**
         * The number of times the evidence has been submitted. You may submit evidence a maximum of 5 times
         */
        submission_count: number;

        /**
         * Date by which evidence must be submitted in order to successfully challenge dispute. Will be null 
         * if the customer’s bank or credit card company doesn’t allow a response for this particular dispute.
         */
        due_by: number;

        /**
         * Whether or not the last evidence submission was submitted past the due date. Defaults to false 
         * if no evidence submissions have occurred. If true, then delivery of the latest evidence is not guaranteed.
         */
        past_due: boolean;
    };

    /**
     * If true, it is still possible to refund the disputed payment. Once the payment has been fully 
     * refunded, no further funds will be withdrawn from your Stripe account as a result of this dispute.
     */
    is_charge_refundable: boolean;
    metadata: IMetadata;
}

interface IDisputeEvidence {
    /**
     * Any server or activity logs showing proof that the customer accessed or downloaded the purchased 
     * digital product. This information should include IP addresses, corresponding timestamps, and any 
     * detailed recorded activity.
     */
    access_activity_log?: string;

    /**
     * The billing addess provided by the customer.
     */
    billing_address?: string;

    /**
     * (ID of a file upload) Your subscription cancellation policy, as shown to the customer.
     */
    cancellation_policy?: string;

    /**
     * An explanation of how and when the customer was shown your refund policy prior to purchase.
     */
    cancellation_policy_disclosure?: string;

    /**
     * A justification for why the customer’s subscription was not canceled.
     */
    cancellation_rebuttal?: string;

    /**
     * (ID of a file upload) Any communication with the customer that you feel is relevant to your case (for 
     * example emails proving that they received the product or service, or demonstrating their use of or 
     * satisfaction with the product or service).
     */
    customer_communication?: string;

    /**
     * The email address of the customer.
     */
    customer_email_address?: string;

    /**
     * The name of the customer.
     */
    customer_name?: string;

    /**
     * The IP address that the customer used when making the purchase.
     */
    customer_purchase_ip?: string;

    /**
     * (ID of a file upload) A relevant document or contract showing the customer’s signature.
     */
    customer_signature?: string;

    /**
     * (ID of a file upload) Documentation for the prior charge that can uniquely identify the charge, 
     * such as a receipt, shipping label, work order, etc. This document should be paired with a similar 
     * document from the disputed payment that proves the two payments are separate.
     */
    duplicate_charge_documentation?: string;

    /**
     * An explanation of the difference between the disputed charge and the prior charge that appears to be a duplicate.
     */
    duplicate_charge_explanation?: string;

    /**
     * The Stripe ID for the prior charge which appears to be a duplicate of the disputed charge.
     */
    duplicate_charge_id?: string;

    /**
     * A description of the product or service which was sold.
     */
    product_description?: string;

    /**
     * (ID of a file upload) Any receipt or message sent to the customer notifying them of the charge.
     */
    receipt?: string;

    /**
     * (ID of a file upload) Your refund policy, as shown to the customer.
     */
    refund_policy?: string;

    /**
     * Documentation demonstrating that the customer was shown your refund policy prior to purchase.
     */
    refund_policy_disclosure?: string;

    /**
     * A justification for why the customer is not entitled to a refund.
     */
    refund_refusal_explanation?: string;

    /**
     * The date on which the customer received or began receiving the purchased service, in a clear human-readable format.
     */
    service_date?: string;

    /**
     * (ID of a file upload) Documentation showing proof that a service was provided to the customer. This could 
     * include a copy of a signed contract, work order, or other form of written agreement.
     */
    service_documentation?: string;

    /**
     * The address to which a physical product was shipped. You should try to include as much complete address information as possible.
     */
    shipping_address?: string;

    /**
     * The delivery service that shipped a physical product, such as Fedex, UPS, USPS, etc. If multiple carriers were used 
     * for this purchase, please separate them with commas.
     */
    shipping_carrier?: string;

    /**
     * The date on which a physical product began its route to the shipping address, in a clear human-readable format.
     */
    shipping_date?: string;

    /**
     * (ID of a file upload) Documentation showing proof that a product was shipped to the customer at the same address 
     * the customer provided to you. This could include a copy of the shipment receipt, shipping label, etc, and should 
     * show the full shipping address of the customer, if possible.
     */
    shipping_documentation?: string;

    /**
     * The tracking number for a physical product, obtained from the delivery service. If multiple tracking numbers 
     * were generated for this purchase, please separate them with commas.
     */
    shipping_tracking_number?: string;

    /**
     * (ID of a file upload) Any additional evidence or statements.
     */
    uncategorized_file?: string;

    /**
     * Any additional evidence or statements.
     */
    uncategorized_text?: string;
}


interface IShippingInformation {
    /**
     * Shipping address.
     */
    address: {
        /**
         * Address line 1 (Street address/PO Box/Company name)
         */
        line1: string;

        /**
         * Address line 2 (Apartment/Suite/Unit/Building)
         */
        line2: string;

        /**
         * City/Suburb/Town/Village
         */
        city: string;

        /**
         * State/Province/County
         */
        state: string;

        /**
         * Zip/Postal Code
         */
        postal_code: string;

        /**
         * 2-letter country code
         */
        country: string;
    };

    /**
     * Recipient name.
     */
    name: string;

    /**
     * The delivery service that shipped a physical product, such as Fedex, UPS, USPS, etc.
     */
    carrier: string;

    /**
     * Recipient phone (including extension).
     */
    phone: string;

    /**
     * The tracking number for a physical product, obtained from the delivery service. If multiple 
     * tracking numbers were generated for this purchase, please separate them with commas.
     */
    tracking_number: string;
}



interface IBalanceTransaction {
    id: string;

    /**
     * Value is 'balance_transaction'
     */
    object: string;

    /**
     * Gross amount of the transaction, in cents.
     */
    amount: number;

    /**
     * The date the transaction’s net funds will become available in the Stripe balance.
     */
    available_on: number;
    created: number;

    /**
     * Three-letter ISO currency code representing the currency.
     */
    currency: string;

    /**
     * Fee (in cents) paid for this transaction
     */
    fee: number;

    /**
     * Detailed breakdown of fees (in cents) paid for this transaction
     */
    fee_details: Array<{
        amount: number;

        /**
         * Three-letter ISO currency code representing the currency of the amount that was disputed.
         */
        currency: string;

        /**
         * Type of the fee, one of: application_fee, stripe_fee or tax.
         */
        type: string;
        application: string;
        description: string;
    }>;

    /**
     * Net amount of the transaction, in cents.
     */
    net: number;

    /**
     * If the transaction’s net funds are available in the Stripe balance yet. Either available or pending.
     */
    status: string;

    /**
     * Type of the transaction, one of: charge, refund, adjustment, application_fee, 
     * application_fee_refund, transfer, transfer_cancel or transfer_failure.
     */
    type: string;
    description?: string;

    /**
     * The Stripe object this transaction is related to.
     */
    source: string;
    source_transfers: IList<ITransfer>;
}


interface IReversal {
    id: string;

    /**
     * Value is 'list'
     */
    object: string;

    /**
     * Amount reversed, in cents.
     */
    amount: number;
    created: number;

    /**
     * Three-letter ISO currency code representing the currency.
     */
    currency: string;

    /**
     * Balance transaction that describes the impact of this reversal on your account balance.
     */
    balance_transaction: string;
    metadata: IMetadata;

    /**
     * ID of the transfer that was reversed.
     */
    transfer: string;
}
interface ITransfer {
    id: string;
    object: string;
    livemode: boolean;

    /**
     * Amount (in cents) to be transferred to your bank account
     */
    amount: number;

    /**
     * Time that this record of the transfer was first created.
     */
    created: number;

    /**
     * Three-letter ISO currency code representing the currency.
     */
    currency: string;

    /**
     * Date the transfer is scheduled to arrive in the bank. This doesn’t factor in delays like weekends or bank holidays.
     */
    date: number;

    /**
     * A list of reversals that have been applied to the transfer.
     */
    reversals: IList<IReversal>;

    /**
     * Whether or not the transfer has been fully reversed. If the transfer is only partially reversed, this attribute 
     * will still be false.
     */
    reversed: boolean;

    /**
     * Current status of the transfer (paid, pending, canceled or failed). A transfer will be pending until it is submitted, at which 
     * point it becomes paid. If it does not go through successfully, its status will change to failed or canceled.
     */
    status: string;

    /**
     * The type of this type of this transfer. Can be card or bank_account.
     "card"|"bank_account"|"stripe_account"
     */
    type: string;//"card"|"bank_account"|"stripe_account";

    /**
     * Amount in cents reversed (can be less than the amount attribute on the transfer if a partial reversal was issued).
     */
    amount_reversed: number;

    /**
     * Balance transaction that describes the impact of this transfer on your account balance.
     */
    balance_transaction: string;

    /**
     * Internal-only description of the transfer
     */
    description: string;

    /**
     * Error code explaining reason for transfer failure if available. See Types of transfer failures for a 
     * list of failure codes: https://stripe.com/docs/api#transfer_failures
     */
    failure_code: string;

    /**
     * Message to user further explaining reason for transfer failure if available.
     */
    failure_message: string;
    metadata: IMetadata;
    application_fee: string;


    /**
     * Hash describing the debit card this transfer was sent to
     */
    card: ICard;

    /**
     * ID of the recipient this transfer is for if one exists. Transfers to your bank account do not have a recipient.
     */
    recipient: string;
    source_transaction: string;
    /** "card"|"bank_account"|"bitcoin_receiver"|"alipay_account"*/
    source_type: string;

    /**
     * Extra information about a transfer to be displayed on the user’s bank statement.
     */
    statement_descriptor: string;
}


/**
* To charge a credit or a debit card, you create a charge object. You can retrieve and refund individual 
* charges as well as list all charges. Charges are identified by a unique random ID.
*/
export interface ICharge {
    id: string;

    /**
     * Value is 'charge'
     */
    object: string;

    livemode: boolean;

    /**
     * Amount charged in cents, positive integer or zero.
     */
    amount: number;

    /**
     * If the charge was created without capturing, this boolean represents whether or not it is 
     * still uncaptured or has since been captured.
     */
    captured: boolean;

    created: number;

    /**
     * Three-letter ISO currency code representing the currency in which the charge was made.
     */
    currency: string;

    paid: boolean;

    /**
     * Whether or not the charge has been fully refunded. If the charge is only partially refunded, 
     * this attribute will still be false.
     */
    refunded: boolean;

    /**
     * A list of refunds that have been applied to the charge.
     */
    refunds: IList<IRefund>;

    /**
     * For most Stripe users, the source of every charge is a credit or debit card. 
     * This hash is then the card object describing that card.
     */
    source: ICard;

    /**
     * The status of the payment is either succeeded or failed.
     */
    status: string;

    /**
     * Amount in cents refunded (can be less than the amount attribute on the charge if a partial refund was issued).
     */
    amount_refunded: number;

    /**
     * ID of the balance transaction that describes the impact of this charge on your account balance (not including refunds or disputes).
     */
    balance_transaction: string;

    /**
     * ID of the customer this charge is for if one exists.
     */
    customer: string;
    description?: string;

    /**
     * Details about the dispute if the charge has been disputed.
     */
    dispute?: IDispute;

    /**
     * Error code explaining reason for charge failure if available (see the errors section for a list of 
     * codes: https://stripe.com/docs/api#errors).
     */
    failure_code: string;

    /**
     * Message to user further explaining reason for charge failure if available.
     */
    failure_message: string;

    /**
     * ID of the invoice this charge is for if one exists.
     */
    invoice: string;
    metadata: IMetadata;

    /**
     * This is the email address that the receipt for this charge was sent to.
     */
    receipt_email: string;

    /**
     * This is the transaction number that appears on email receipts sent for this charge.
     */
    receipt_number: string;
    application_fee?: string;

    /**
     * Hash with information on fraud assessments for the charge.
     */
    fraud_details: {
        /**
         * Assessments reported by you have the key user_report and, if set, possible values of safe and fraudulent.
         */
        user_report?: string;

        /**
         * Assessments from Stripe have the key stripe_report and, if set, the value fraudulent.
         */
        stripe_report?: string;
    };

    /**
     * Shipping information for the charge.
     */
    shipping?: IShippingInformation;
}

interface IChargeCreateOptions {
    /**
     * A positive integer in the smallest currency unit (e.g 100 cents to charge $1.00, or 1 to charge ¥1, a 0-decimal currency) 
     * representing how much to charge the card. The minimum amount is $0.50 (or equivalent in charge currency).
     */
    amount: number;

    /**
     * 3-letter ISO code for currency.
     */
    currency: string;

    /**
     * The ID of an existing customer that will be charged in this request.
    optional, either customer or source is required

     */
    customer?: string;

    /**
     * A payment source to be charged, such as a credit card. If you also pass a customer ID, the source must be the ID of 
     * a source belonging to the customer. Otherwise, if you do not pass a customer ID, the source you provide must either 
     * be a token, like the ones returned by Stripe.js, or a object containing a user's credit card details, with the options 
     * described below. Although not all information is required, the extra info helps prevent fraud.

    optional, either source or customer is required
     */
    source?: string | ICard | any; //haven't completed

    /**
     * An arbitrary string which you can attach to a charge object. It is displayed when in the web interface alongside the 
     * charge. Note that if you use Stripe to send automatic email receipts to your customers, your receipt emails will include 
     * the description of the charge(s) that they are describing.
     */
    description?: string;
    metadata?: IMetadata;

    /**
     * Whether or not to immediately capture the charge. When false, the charge issues an authorization (or pre-authorization), 
     * and will need to be captured later. Uncaptured charges expire in 7 days. For more information, see authorizing charges 
     * and settling later: https://support.stripe.com/questions/can-i-authorize-a-charge-and-then-wait-to-settle-it-later
     */
    capture?: boolean;

    /**
     * An arbitrary string to be displayed on your customer's credit card statement. This may be up to 22 characters. 
     * As an example, if your website is RunClub and the item you're charging for is a race ticket, you may want to 
     * specify a statement_descriptor of RunClub 5K race ticket. The statement description may not include <>"' characters, 
     * and will appear on your customer's statement in capital letters. Non-ASCII characters are automatically stripped. 
     * While most banks display this information consistently, some may display it incorrectly or not at all.
     */
    statement_descriptor?: string;

    /**
     * The email address to send this charge's receipt to. The receipt will not be sent until the charge is paid. 
     * If this charge is for a customer, the email address specified here will override the customer's email address. 
     * Receipts will not be sent for test mode charges. If receipt_email is specified for a charge in live mode, a receipt 
     * will be sent regardless of your email settings.
     */
    receipt_email?: string;

    /**
     * CONNECT ONLY .  A fee in cents that will be applied to the charge and transferred to the application owner's Stripe account. 
     * The request must be made with an OAuth key in order to take an application fee. For more information, 
     * see the application fees documentation: https://stripe.com/docs/connect/collecting-fees
     */
    application_fee?: string;
    /** CONNECT ONLY
optional
An account to make the charge on behalf of. If specified, the charge will be attributed to the destination account for tax reporting, and the funds from the charge will be transferred to the destination account. The ID of the resulting transfer will be returned in the transfer field of the response. See the documentation for details.*/
    destination?: any;

    /**
     * Shipping information for the charge. Helps prevent fraud on charges for physical goods.
     */
    shipping?: IShippingInformation;
}


/**
        * A subscription plan contains the pricing information for different products and feature levels on your site. 
        * For example, you might have a $10/month plan for basic features and a different $20/month plan for premium features.
        */
export interface IPlan {
    id: string;

    /**
     * Value is 'plan'
     */
    object: string;
    livemode: boolean;

    /**
     * The amount in cents to be charged on the interval specified
     */
    amount: number;
    created: number;

    /**
     * Currency in which subscription will be charged
     */
    currency: string;

    /**
     * One of day, week, month or year. The frequency with which a subscription should be billed.
     */
    interval: string;

    /**
     * The number of intervals (specified in the interval property) between each subscription billing. For example, 
     * interval=month and interval_count=3 bills every 3 months.
     */
    interval_count: number;

    /**
     * Display name of the plan
     */
    name: string;

    /**
     * A set of key/value pairs that you can attach to a plan object. It can be useful for storing additional information 
     * about the plan in a structured format.
     */
    metadata: IMetadata;

    /**
     * Number of trial period days granted when subscribing a customer to this plan. Null if the plan has no trial period.
     */
    trial_period_days: number;

    /**
     * Extra information about a charge for the customer’s credit card statement.
     */
    statement_descriptor: string;
}
/**
  * A discount represents the actual application of a coupon to a particular customer. It contains information 
  * about when the discount began and when it will end.
  */
interface IDiscount {
    /**
     * Value is 'discount'
     */
    object: string;

    /**
     * Hash describing the coupon applied to create this discount
     */
    coupon: ICoupon;
    customer: string;

    /**
     * Date that the coupon was applied
     */
    start: number;

    /**
     * If the coupon has a duration of once or repeating, the date that this discount will end. If the coupon 
     * used has a forever duration, this attribute will be null.
     */
    end: number;

    /**
     * The subscription that this coupon is applied to, if it is applied to a particular subscription
     */
    subscription: string;
}

/**
 * A coupon contains information about a percent-off or amount-off discount you might want to apply to a customer. 
 * Coupons only apply to invoices; they do not apply to one-off charges.
 */
interface ICoupon {
    id: string;

    /**
     * Value is 'coupon'
     */
    object: string;
    livemode: boolean;
    created: number;

    /**
     * One of forever, once, and repeating. Describes how long a customer who applies this coupon will get the discount.
     */
    duration: string;

    /**
     * Amount (in the currency specified) that will be taken off the subtotal of any invoices for this customer.
     */
    amount_off: number;

    /**
     * If amount_off has been set, the currency of the amount to take off.
     */
    currency: string;

    /**
     * If duration is repeating, the number of months the coupon applies. Null if coupon duration is forever or once.
     */
    duration_in_months: number;

    /**
     * Maximum number of times this coupon can be redeemed, in total, before it is no longer valid.
     */
    max_redemptions: number;

    /**
     * A set of key/value pairs that you can attach to a coupon object. It can be useful for storing 
     * additional information about the coupon in a structured format.
     */
    metadata: IMetadata;


    /**
     * Percent that will be taken off the subtotal of any invoices for this customer for the duration 
     * of the coupon. For example, a coupon with percent_off of 50 will make a $100 invoice $50 instead.
     */
    percent_off: number;

    /**
     * Date after which the coupon can no longer be redeemed
     */
    redeem_by: number;

    /**
     * Number of times this coupon has been applied to a customer.
     */
    times_redeemed: number;

    /**
     * Taking account of the above properties, whether this coupon can still be applied to a customer
     */
    valid: boolean;
}
/**
      * A Bitcoin receiver wraps a Bitcoin address so that a customer can push a payment to you. This guide describes how to use 
      * receivers to create Bitcoin payments.
      */
export interface IBitcoinReceiver {
    id: string;

    /**
     * Value is 'bitcoin_receiver'
     */
    object: string;
    livemode: boolean;

    /**
     * True when this bitcoin receiver has received a non-zero amount of bitcoin.
     */
    active: boolean;

    /**
     * The amount of currency that you are collecting as payment.
     */
    amount: number;

    /**
     * The amount of currency to which bitcoin_amount_received has been converted.
     */
    amount_received: number;

    /**
     * The amount of bitcoin that the customer should send to fill the receiver. The bitcoin_amount is denominated in Satoshi: 
     * there are 10^8 Satoshi in one bitcoin.
     */
    bitcoin_amount: number;

    /**
     * The amount of bitcoin that has been sent by the customer to this receiver.
     */
    bitcoin_amount_received: number;

    /**
     * This URI can be displayed to the customer as a clickable link (to activate their bitcoin client) or as a QR code (for mobile wallets).
     */
    bitcoin_uri: number;
    created: number;

    /**
     * Three-letter ISO currency code representing the currency to which the bitcoin will be converted.
     */
    currency: string;

    /**
     * This flag is initially false and updates to true when the customer sends the bitcoin_amount to this receiver.
     */
    filled: boolean;

    /**
     * A bitcoin address that is specific to this receiver. The customer can send bitcoin to this address to fill the receiver.
     */
    inbound_address: string;

    /**
     * A list with one entry for each time that the customer sent bitcoin to the receiver. Hidden when viewing the 
     * receiver with a publishable key.
     */
    transactions: IList<IBitcoinTransaction>;

    /**
     * This receiver contains uncaptured funds that can be used for a payment or refunded.
     */
    uncaptured_funds: boolean;
    description: string;

    /**
     * The customer’s email address, set by the API call that creates the receiver.
     */
    email: string;

    /**
     * A set of key/value pairs that you can attach to a customer object. It can be useful for storing additional information 
     * about the customer in a structured format.
     */
    metadata: IMetadata;

    /**
     * The ID of the payment created from the receiver, if any. Hidden when viewing the receiver with a publishable key.
     */
    payment: string;

    /**
     * The refund address for these bitcoin, if communicated by the customer.
     */
    refund_address: string;
    customer: string;

    used_for_payment: boolean;
}

interface IBitcoinTransaction {
    id: string;

    /**
     * Value is 'list'
     */
    object: string;

    /**
     * The amount of currency that the transaction was converted to in real-time.
     */
    amount: number;

    /**
     * The amount of bitcoin contained in the transaction.
     */
    bitcoin_amount: number;
    created: number;

    /**
     * The currency to which this transaction was converted.
     */
    currency: string;

    /**
     * The receiver to which this transaction was sent.
     */
    receiver: string;
}


/**
    * Subscriptions allow you to charge a customer's card on a recurring basis. A subscription ties a customer to 
    * a particular plan you've created: https://stripe.com/docs/api#create_plan
    */
export interface ISubscription {
    id: string;

    /**
     * Value is 'subscription'
     */
    object: string;

    /**
     * If the subscription has been canceled with the at_period_end flag set to true, cancel_at_period_end on the 
     * subscription will be true. You can use this attribute to determine whether a subscription that has a status 
     * of active is scheduled to be canceled at the end of the current period.
     */
    cancel_at_period_end: boolean;
    customer: string;

    /**
     * Hash describing the plan the customer is subscribed to
     */
    plan: IPlan;

    /**
     * The number of subscriptions for the associated plan
     */
    quantity: number;

    /**
     * Date the subscription started
     */
    start: number;

    /**
     * Possible values are trialing, active, past_due, canceled, or unpaid. A subscription still in its trial period is trialing 
     * and moves to active when the trial period is over. When payment to renew the subscription fails, the subscription becomes 
     * past_due. After Stripe has exhausted all payment retry attempts, the subscription ends up with a status of either canceled 
     * or unpaid depending on your retry settings. Note that when a subscription has a status of unpaid, no subsequent invoices 
     * will be attempted (invoices will be created, but then immediately automatically closed. Additionally, updating customer 
     * card details will not lead to Stripe retrying the latest invoice.). After receiving updated card details from a customer, 
     * you may choose to reopen and pay their closed invoices.
     */
    status: string;

    /**
     * A positive decimal that represents the fee percentage of the subscription invoice amount that will be transferred to 
     * the application owner’s Stripe account each billing period.
     */
    application_fee_percent: number;

    /**
     * If the subscription has been canceled, the date of that cancellation. If the subscription was canceled with 
     * cancel_at_period_end, canceled_at will still reflect the date of the initial cancellation request, not the end of the 
     * subscription period when the subscription is automatically moved to a canceled state.
     */
    canceled_at: number;

    /**
     * End of the current period that the subscription has been invoiced for. At the end of this period, a new invoice will be created.
     */
    current_period_end: number;

    /**
     * Start of the current period that the subscription has been invoiced for
     */
    current_period_start: number;

    /**
     * Describes the current discount applied to this subscription, if there is one. When billing, a discount applied to a 
     * subscription overrides a discount applied on a customer-wide basis.
     */
    discount: IDiscount;

    /**
     * If the subscription has ended (either because it was canceled or because the customer was switched to a subscription 
     * to a new plan), the date the subscription ended
     */
    ended_at: number;

    /**
     * A set of key/value pairs that you can attach to a subscription object. It can be useful for storing additional 
     * information about the subscription in a structured format.
     */
    metadata: IMetadata;

    /**
     * If the subscription has a trial, the end of that trial.
     */
    trial_end: number;

    /**
     * If the subscription has a trial, the beginning of that trial.
     */
    trial_start: number;

    /**
     * If provided, each invoice created by this subscription will apply the tax rate, increasing the amount billed to the customer.
     */
    tax_percent: number;
}
/** An Alipay account object allows you to accept Alipay payments. Alipay account objects can only be created through Checkout.*/
export interface IAlipayAccount {
    id: string;
    /** "alipay_account"*/
    object: string;//"alipay_account";
    livemode: boolean;
    created: number;
    customer: string;
    /** Uniquely identifies the account and will be the same across all Alipay account objects that are linked to the same Alipay account.*/
    fingerprint: string;

    /**A set of key/value pairs that you can attach to a customer object. It can be useful for storing additional information about the customer in a structured format.*/
    metadata: IMetadata;
    /**positive integer
If the Alipay account object is not reusable, the exact amount that you can create a charge for.*/
    payment_amount: number;
    /** currency
If the Alipay account object is not reusable, the exact currency that you can create a charge for.*/
    payment_currency: string;
    /** boolean
True if you can create multiple payments using this account. If the account is reusable, then you can freely choose the amount of each payment.*/
    reusable: boolean;
    /** boolean
Whether this Alipay account object has ever been used for a payment.*/
    used: boolean;
    /** The username for the Alipay account.*/
    username;

}

/**
    * Customer objects allow you to perform recurring charges and track multiple charges that are associated 
    * with the same customer. The API allows you to create, delete, and update your customers. You can 
    * retrieve individual customers as well as a list of all your customers.
    */
export interface ICustomer {
    id: string;

    /**
     * Value is 'customer'
     */
    object: string;//"customer";
    livemode: boolean;
    created: number;

    /**
     * Current balance, if any, being stored on the customer’s account. If negative, the customer has credit to apply to 
     * the next invoice. If positive, the customer has an amount owed that will be added to the next invoice. The balance 
     * does not refer to any unpaid invoices; it solely takes into account amounts that have yet to be successfully applied 
     * to any invoice. This balance is only taken into account for recurring charges.
     */
    account_balance?: number;

    /**
     * The currency the customer can be charged in for recurring billing purposes (subscriptions, invoices, invoice items).
     */
    currency: string;

    /**
     * ID of the default source attached to this customer.
     */
    default_source: string;

    /**
     * Whether or not the latest charge for the customer’s latest invoice has failed
     */
    delinquent: boolean;

    /**
     * Describes the current discount active on the customer, if there is one.
     */
    discount: IDiscount;
    description?: string;
    email?: string;

    /**
     * A set of key/value pairs that you can attach to a customer object. It can be useful for storing 
     * additional information about the customer in a structured format.
     */
    metadata?: IMetadata;

    shipping: IShippingInformation;

    sources?: IList<ICard | IBitcoinReceiver | IAlipayAccount>;

    /**
     * The customer’s current subscriptions, if any
     */
    subscriptions: IList<ISubscription>;
}
/** Often you want to be able to charge credit cards or send payments to bank accounts without having to hold sensitive card information on your own servers. Stripe.js makes this easy in the browser, but you can use the same technique in other environments with our token API.
Tokens can be created with your publishable API key, which can safely be embedded in downloadable applications like iPhone and Android apps. You can then use a token anywhere in our API that a card or bank account is accepted. Note that tokens are not meant to be stored or used more than once—to store these details for use later, you should create Customer or Recipient objects.*/
export interface IToken {

    id: string;

    /**
     * Value is 'token'
     */
    object: string;//"token";
    livemode: boolean;
    created: number;
    /** IP address of the client that generated the token*/
    client_ip: string;
    /** Type of the token 
    "card"|"bank_account"|"alipay_account"*/
    type: string;//"card"|"bank_account"|"alipay_account";
    /** Whether or not this token has already been used (tokens can be used only once)*/
    used: boolean;
    /** NOT DOCUMENTED: email address associated with the checkout */
    email?: string;


    /** NOT DOCUMENTED, used when type=alipay_account */
    alipay_account?: IAlipayAccount;
    card?: ICard;
    /** hash
Hash describing the bank account, i supposed used when type=bank_account */
    bank_account?: any;
}


interface IInvoiceLineItem {
	/**
	 * The ID of the source of this line item, either an invoice item or a subscription
	 */
	id: string;

	/**
	 * Value is 'line_item'
	 */
	object: string;

	/**
	 * Whether or not this is a test line item
	 */
	livemode: boolean;

	/**
	 * The amount, in cents
	 */
	amount: number;
	currency: string;

	/**
	 * If true, discounts will apply to this line item. Always false for prorations.
	 */
	discountable: boolean;

	/**
	 * The period this line_item covers
	 */
	period: {
		/**
		 * The period start date
		 */
		start: number;
		/**
		 * The period end date
		 */
		end: number;
	};

	/**
	 * Whether or not this is a proration
	 */
	proration: boolean;

	/**
	 * A string identifying the type of the source of this line item, either an invoiceitem or a subscription
	 */
	type: string;

	/**
	 * A text description of the line item, if the line item is an invoice item
	 */
	description: string;

	/**
	 * Key-value pairs attached to the line item, if the line item is an invoice item
	 */
	metadata: IMetadata;

	/**
	 * The plan of the subscription, if the line item is a subscription or a proration
	 */
	plan: IPlan;

	/**
	 * The quantity of the subscription, if the line item is a subscription or a proration
	 */
	quantity: number;

	/**
	 * When type is invoiceitem, the subscription that the invoice item pertains to, if any. Left blank when 
	 * type is already subscription, as it’d be redundant with id.
	 */
	subscription: string;
}

/**
 * Invoices are statements of what a customer owes for a particular billing period, including subscriptions, 
 * invoice items, and any automatic proration adjustments if necessary. Once an invoice is created, payment 
 * is automatically attempted. Note that the payment, while automatic, does not happen exactly at the time of 
 * invoice creation. If you have configured webhooks, the invoice will wait until one hour after the last 
 * webhook is successfully sent (or the last webhook times out after failing). Any customer credit on the 
 * account is applied before determining how much is due for that invoice (the amount that will be actually 
 * charged). If the amount due for the invoice is less than 50 cents (the minimum for a charge), we add the 
 * amount to the customer's running account balance to be added to the next invoice. If this amount is 
 * negative, it will act as a credit to offset the next invoice. Note that the customer account balance does 
 * not include unpaid invoices; it only includes balances that need to be taken into account when calculating 
 * the amount due for the next invoice.
 */
interface IInvoice {
	id: string;

	/**
	 * Value is 'invoice'
	 */
	object: string;
	livemode: boolean;

	/**
	 * Final amount due at this time for this invoice. If the invoice’s total is smaller than the minimum charge 
	 * amount, for example, or if there is account credit that can be applied to the invoice, the amount_due may 
	 * be 0. If there is a positive starting_balance for the invoice (the customer owes money), the amount_due 
	 * will also take that into account. The charge that gets generated for the invoice will be for the amount 
	 * specified in amount_due.
	 */
	amount_due: number;

	/**
	 * Number of payment attempts made for this invoice, from the perspective of the payment retry schedule. Any 
	 * payment attempt counts as the first attempt, and subsequently only automatic retries increment the attempt 
	 * count. In other words, manual payment attempts after the first attempt do not affect the retry schedule.
	 */
	attempt_count: number;

	/**
	 * Whether or not an attempt has been made to pay the invoice. An invoice is not attempted until 1 hour after 
	 * the invoice.created webhook, for example, so you might not want to display that invoice as unpaid to your 
	 * users.
	 */
	attempted: boolean;

	/**
	 * Whether or not the invoice is still trying to collect payment. An invoice is closed if it’s either paid or 
	 * it has been marked closed. A closed invoice will no longer attempt to collect payment.
	 */
	closed: boolean;
	currency: string;
	customer: string;
	date: number;

	/**
	 * Whether or not the invoice has been forgiven. Forgiving an invoice instructs us to update the subscription 
	 * status as if the invoice were succcessfully paid. Once an invoice has been forgiven, it cannot be unforgiven 
	 * or reopened
	 */
	forgiven: boolean;

	/**
	 * The individual line items that make up the invoice
	 */
	lines: IList<IInvoiceLineItem>;

	/**
	 * Whether or not payment was successfully collected for this invoice. An invoice can be paid (most commonly) 
	 * with a charge or with credit from the customer’s account balance.
	 */
	paid: boolean;

	/**
	 * End of the usage period during which invoice items were added to this invoice
	 */
	period_end: number;

	/**
	 * Start of the usage period during which invoice items were added to this invoice
	 */
	period_start: number;

	/**
	 * Starting customer balance before attempting to pay invoice. If the invoice has not been attempted yet, 
	 * this will be the current customer balance.
	 */
	starting_balance: number;

	/**
	 * Total of all subscriptions, invoice items, and prorations on the invoice before any discount is applied
	 */
	subtotal: number;

	/**
	 * Total after discount
	 */
	total: number;

	/**
	 * The fee in cents that will be applied to the invoice and transferred to the application owner’s 
	 * Stripe account when the invoice is paid.
	 */
	application_fee: number;

	/**
	 * ID of the latest charge generated for this invoice, if any.
	 */
	charge: string;
	description: string;
	discount: IDiscount;

	/**
	 * Ending customer balance after attempting to pay invoice. If the invoice has not been attempted yet, 
	 * this will be null.
	 */
	ending_balance: number;

	/**
	 * The time at which payment will next be attempted.
	 */
	next_payment_attempt: number;

	/**
	 * This is the transaction number that appears on email receipts sent for this invoice.
	 */
	receipt_number: string;

	/**
	 * Extra information about an invoice for the customer’s credit card statement.
	 */
	statement_descriptor: string;

	/**
	 * The subscription that this invoice was prepared for, if any.
	 */
	subscription: string;

	/**
	 * The time at which webhooks for this invoice were successfully delivered (if the invoice had no webhooks to 
	 * deliver, this will match date). Invoice payment is delayed until webhooks are delivered, or until all webhook 
	 * delivery attempts have been exhausted.
	 */
	webhooks_delivered_at: number;

	/**
	 * A set of key/value pairs that you can attach to an invoice object. It can be useful for storing additional 
	 * information about the invoice in a structured format.
	 */
	metadata: IMetadata;

	/**
	 * The amount of tax included in the total, calculated from tax_percent and the subtotal. If no tax_percent 
	 * is defined, this value will be null.
	 */
	tax: number;

	/**
	 * This percentage of the subtotal has been added to the total amount of the invoice, including invoice line 
	 * items and discounts. This field is inherited from the subscription’s tax_percent field, but can be changed 
	 * before the invoice is paid. This field defaults to null.
	 */
	tax_percent: number;
}




export interface StripeInstance {
    /** When we make backwards-incompatible changes to the API, we release new, dated versions. example version is "2016-02-03" */
    setApiVersion(versionDate: string);
    /** To charge a credit or a debit card, you create a charge object. You can retrieve and refund individual charges as well as list all charges. Charges are identified by a unique random ID.*/
    charges: {
        /** To charge a credit card, you create a charge object. If your API key is in test mode, the supplied payment source (e.g., card or Bitcoin receiver) won't actually be charged, though everything else will occur as if in live mode. (Stripe assumes that the charge would have completed successfully).*/
        create(options: IChargeCreateOptions): Promise<ICharge>;
        /** Retrieves the details of a charge that has previously been created. Supply the unique charge ID that was returned from your previous request, and Stripe will return the corresponding charge information. The same information is returned when creating or refunding the charge.*/
        retrieve(/** The identifier of the charge to be retrieved.*/charge: string): Promise<ICharge>;
        update(charge: string, options: any): Promise<ICharge>;
        capture(charge: string): Promise<ICharge>;
		/** List all charges
Returns a list of charges you’ve previously created. The charges are returned in sorted order, with the most recent charges appearing first.
		Returns
A object with a data property that contains an array of up to limit charges, starting after charge starting_after. Each entry in the array is a separate charge object. If no more charges are available, the resulting array will be empty. If you provide a non-existent customer ID, this call throws an error.
You can optionally request that the response include the total count of all charges that match your filters. To do so, specify include[]=total_count in your request.
		*/
        list(options: {
			/**A filter on the list based on the object created field. The value can be a string with an integer Unix timestamp, or it can be a dictionary with the following options:
 child arguments
*/
			created?: any;
			/**Only return charges for the customer specified by this customer ID.*/
			customer?: string;
			/**A cursor for use in pagination. ending_before is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, starting with obj_bar, your subsequent call can include ending_before=obj_bar in order to fetch the previous page of the list.*/
			ending_before?: any;
			/**optional, default is 10
A limit on the number of objects to be returned. Limit can range between 1 and 100 items.*/
			limit?: number;
			/**optional object, default is { object: 'all' }
A filter on the list based on the source of the charge. The value can be a dictionary with the following options:*/
			source?: any;
			/**optional
A cursor for use in pagination. starting_after is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with obj_foo, your subsequent call can include starting_after=obj_foo in order to fetch the next page of the list.*/
			starting_after?: any;

		}): Promise<IList<ICharge>>;


    };
    /** You can create plans easily via the plan management page of the Stripe dashboard. Plan creation is also accessible via the API if you need to create plans on the fly. */
    plans: {
        /** todo: document*/
        create(...args: any[]);
        /** Retrieves the plan with the given ID. */
        retrieve(
            /** The ID of the desired plan. */
            plan: string): Promise<IPlan>;
        /** todo: document*/
        update(...args: any[]);
        /** todo: document*/
        del(...args: any[]);
        /** Returns a list of your plans. 
        
        Returns
        A object with a data property that contains an array of up to limit plans, starting after plan starting_after. Each entry in the array is a separate plan object. If no more plans are available, the resulting array will be empty. This request should never throw an error.
        You can optionally request that the response include the total count of all plans that match your filters. To do so, specify include[]=total_count in your request.*/
        list(options: {
            /** optional object
            A filter on the list based on the object created field. The value can be a string with an integer Unix timestamp, or it can be a dictionary with the following options:
            child arguments
            gt
            optional
            Return values where the created field is after this timestamp.
            gte
            optional
            Return values where the created field is after or equal to this timestamp.
            lt
            optional
            Return values where the created field is before this timestamp.
            lte
            optional
            Return values where the created field is before or equal to this timestamp.
                        
            */
            created?: string | number | { gt?: string | number; gte?: string | number; lt?: string | number; lte?: string | number; };
            /** optional
            A cursor for use in pagination. ending_before is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, starting with obj_bar, your subsequent call can include ending_before=obj_bar in order to fetch the previous page of the list.*/
            ending_before?: any;
            /** optional, default is 10
            A limit on the number of objects to be returned. Limit can range between 1 and 100 items.*/
            limit?: number;
            /** optional
            A cursor for use in pagination. starting_after is an object ID that defines your place in the list. For instance, if you make a list request and receive 100 objects, ending with obj_foo, your subsequent call can include starting_after=obj_foo in order to fetch the next page of the list.*/
            starting_after?: any;

        }): Promise<IList<IPlan>>;

    };
	/** Customer objects allow you to perform recurring charges and track multiple charges that are associated with the same customer. The API allows you to create, delete, and update your customers. You can retrieve individual customers as well as a list of all your customers.*/
	customers: {
		/** Returns
		Returns a customer object if the call succeeded. The returned object will have information about subscriptions, discount, and payment sources, if that information has been provided. If an invoice payment is due and a source is not provided, the call will throw an error. If a non-existent plan or a non-existent or expired coupon is provided, the call will throw an error.
		If a source has been attached to the customer, the returned customer object will have a default_source attribute, which is an ID that can be expanded into the full source details when retrieving the customer.*/
		create(options: {
			/** optional
			An integer amount in cents that is the starting account balance for your customer. A negative amount represents a credit that will be used before attempting any charges to the customer’s card; a positive amount will be added to the next invoice.*/
			account_balance?: number;
			/** optional
			If you provide a coupon code, the customer will have a discount applied on all recurring charges. Charges you create through the API will not have the discount.*/
			coupon?: string;
			/** optional
			An arbitrary string that you can attach to a customer object. It is displayed alongside the customer in the dashboard. This can be unset by updating the value to null and then saving.*/
			description?: string;
			/** optional
			Customer’s email address. It’s displayed alongside the customer in your dashboard and can be useful for searching and tracking. This can be unset by updating the value to null and then saving.*/
			email?: string;
			/** optional
			A set of key/value pairs that you can attach to a customer object. It can be useful for storing additional information about the customer in a structured format. This can be unset by updating the value to null and then saving.*/
			metadata?: IMetadata;
			/** optional
			The identifier of the plan to subscribe the customer to. If provided, the returned customer object will have a list of subscriptions that the customer is currently subscribed to. If you subscribe a customer to a plan without a free trial, the customer must have a valid card as well.*/
			plan?: string;
			/** optional
			The quantity you’d like to apply to the subscription you’re creating (if you pass in a plan). For example, if your plan is 10 cents/user/month, and your customer has 5 users, you could pass 5 as the quantity to have the customer charged 50 cents (5 x 10 cents) monthly. Defaults to 1 if not set. Only applies when the plan parameter is also provided.*/
			quantity?: number;

			shipping?: IShippingInformation;
			/** optional object
			The source can either be a token, like the ones returned by our Stripe.js, or a dictionary containing a user’s credit card details (with the options shown below).*/
			source?: string; // IToken | IBitcoinReceiver;
			/** optional
			A positive decimal (with at most two decimal places) between 1 and 100. This represents the percentage of the subscription invoice subtotal that will be calculated and added as tax to the final amount each billing period. For example, a plan which charges $10/month with a tax_percent of 20.0 will charge $12 per invoice. Can only be used if a plan is provided.*/
			tax_percent?: number;
			/** optional
			Unix timestamp representing the end of the trial period the customer will get before being charged. If set, trial_end will override the default trial period of the plan the customer is being subscribed to. The special value now can be provided to end the customer’s trial immediately. Only applies when the plan parameter is also provided.*/
			trial_end?: number;

		}): Promise<ICustomer>;
		/** Retrieves the details of an existing customer. You need only supply the unique customer identifier that was returned upon customer creation.
		Returns
		Returns a customer object if a valid identifier was provided. When requesting the ID of a customer that has been deleted, a subset of the customer’s information will be returned, including a deleted property, which will be true.*/
		retrieve(customerId: string): Promise<ICustomer>;
		/** Updates the specified customer by setting the values of the parameters passed. Any parameters not provided will be left unchanged. For example, if you pass the source parameter, that becomes the customer's active source (e.g., a card) to be used for all charges in the future. When you update a customer to a new valid source: for each of the customer's current subscriptions, if the subscription is in the past_due state, then the latest unpaid, unclosed invoice for the subscription will be retried (note that this retry will not count as an automatic retry, and will not affect the next regularly scheduled payment for the invoice). (Note also that no invoices pertaining to subscriptions in the unpaid state, or invoices pertaining to canceled subscriptions, will be retried as a result of updating the customer's source.)
This request accepts mostly the same arguments as the customer creation call.
		Returns
Returns the customer object if the update succeeded. Throws an error if update parameters are invalid (e.g. specifying an invalid coupon or an invalid source).*/
		update(stripeCustomerId:string,
			options: {

				/**optional
				An integer amount in cents that represents the account balance for your customer.Account balances only affect invoices.A negative amount represents a credit that decreases the amount due on an invoice; a positive amount increases the amount due on an invoice.
							*/
				account_balance?:number;
				/**
			optional
			If you provide a coupon code, the customer will have a discount applied on all recurring charges.Charges you create through the API will not have the discount.
						*/
				coupon?:string;
				/*
			optional
			ID of source to make the customer’s new default for invoice payments*/
				default_source?:string;
				/*
			   optional
			   An arbitrary string that you can attach to a customer object.It is displayed alongside the customer in the dashboard.This can be unset by updating the value to null and then saving.*/
				description?:string;
				/*
			optional
			Customer’s email address.It’s displayed alongside the customer in your dashboard and can be useful for searching and tracking.This can be unset by updating the value to null and then saving.*/
				email?:string;

				/*optional
				A set of key/ value pairs that you can attach to a customer object.It can be useful for storing additional information about the customer in a structured format.This can be unset by updating the value to null and then saving*/
				metadata?:IMetadata;

				/*optional object
				child arguments*/
				shipping?:IShippingInformation;


				/*optional object
				The source can either be a token, like the ones returned by our Stripe.js, or a dictionary containing a user’s credit card details (with the options shown below).
				Passing source will create a new source object, make it the new customer default source, and delete the old customer default if one exists.
				If you want to add additional sources instead of replacing the existing default, use the card creation API.
				Whenever you attach a card to a customer, Stripe will automatically validate the card.
				child arguments*/
				source?:string|ICard;

			}):Promise<ICustomer>
		/** Delete a card
		You can delete cards from a customer, recipient, or managed account.
		For customers: if you delete a card that is currently the default source, then the most recently added source will become the new default. If you delete a card that is the last remaining source on the customer then the default_source attribute will become null.
		For recipients: if you delete the default card, then the most recently added card will become the new default. If you delete the last remaining card on a recipient, then the default_card attribute will become null.
		For accounts: if a card's default_for_currency property is true, it can only be deleted if it is the only external account for its currency, and the currency is not the Stripe account's default currency. Otherwise, before deleting the card, you must set another external account to be the default for the currency.
		Note that for cards belonging to customers, you may want to prevent customers on paid subscriptions from deleting all cards on file so that there is at least one default card for the next invoice payment attempt.*/
		deleteCard(customerId: string, cardId: string): Promise<{ deleted: boolean; id: string }>;
		/** Create a card
		When you create a new credit card, you must specify a customer, recipient, or managed account to create it on.
		If the card's owner has no default card, then the new card will become the default. However, if the owner already has a default then it will not change. To change the default, you should either update the customer to have a new default_source, update the recipient to have a new default_card, or set default_for_currency to true when creating a card for a managed account. */
		createSource(customerId: string, options: {/** token from stripe checkout */source: string }): Promise<ICard | IAlipayAccount>;
		createSource(customerId: string, options: {/** token from stripe checkout */source: string }, /** optional A set of key/value pairs that you can attach to a card object. It can be useful for storing additional information about the card in a structured format. */ metadata: IMetadata): Promise<ICard | IAlipayAccount | IBitcoinReceiver>;


		/** Cancels a customer’s subscription. If you set the at_period_end parameter to true, the subscription will remain active until the end of the period, at which point it will be canceled and not renewed. By default, the subscription is terminated immediately. In either case, the customer will not be charged again for the subscription. Note, however, that any pending invoice items that you’ve created will still be charged for at the end of the period unless manually deleted. If you’ve set the subscription to cancel at period end, any pending prorations will also be left in place and collected at the end of the period, but if the subscription is set to cancel immediately, pending prorations will be removed.
		By default, all unpaid invoices for the customer will be closed upon subscription cancellation. We do this in order to prevent unexpected payment retries once the customer has canceled a subscription. However, you can reopen the invoices manually after subscription cancellation to have us proceed with automatic retries, or you could even re-attempt payment yourself on all unpaid invoices before allowing the customer to cancel the subscription at all.*/
		cancelSubscription(customerId: string, subscriptionId: string, options: { at_period_end?: boolean }): Promise<ISubscription>;
		/** Creates a new subscription on an existing customer.*/
		createSubscription(customerId: string, options: {
			/** REQUIRED
			The identifier of the plan to subscribe the customer to.*/
			plan: string;
			/** optional, default is null
			A positive decimal (with at most two decimal places) between 1 and 100. This represents the percentage of the subscription invoice subtotal that will be transferred to the application owner’s Stripe account. The request must be made with an OAuth key in order to set an application fee percentage. For more information, see the application fees documentation.*/
			application_fee_percent?: number;
			/** optional, default is null
			The code of the coupon to apply to this subscription. A coupon applied to a subscription will only affect invoices created for that particular subscription.*/
			coupon?: string;
			/** optional, default is null
			The source can either be a token, like the ones returned by our Stripe.js, or a object containing a user's credit card details (with the options shown below). You must provide a source if the customer does not already have a valid source attached, and you are subscribing the customer for a plan that is not free. Passing source will create a new source object, make it the customer default source, and delete the old customer default if one exists. If you want to add an additional source to use with subscriptions, instead use the card creation API to add the card and then the customer update API to set it as the default. Whenever you attach a card to a customer, Stripe will automatically validate the card.*/
			source?: string; //IToken | IBitcoinReceiver;
			/** optional, default is 1
			The quantity you'd like to apply to the subscription you're creating. For example, if your plan is $10/user/month, and your customer has 5 users, you could pass 5 as the quantity to have the customer charged $50 (5 x $10) monthly. If you update a subscription but don't change the plan ID (e.g. changing only the trial_end), the subscription will inherit the old subscription's quantity attribute unless you pass a new quantity parameter. If you update a subscription and change the plan ID, the new subscription will not inherit the quantity attribute and will default to 1 unless you pass a quantity parameter.*/
			quantity?: number;
			/** optional, default is { }
			A set of key/value pairs that you can attach to a subscription object. It can be useful for storing additional information about the subscription in a structured format.*/
			metadata?: IMetadata;
			/** optional, default is null
			A positive decimal (with at most two decimal places) between 1 and 100. This represents the percentage of the subscription invoice subtotal that will be calculated and added as tax to the final amount each billing period. For example, a plan which charges $10/month with a tax_percent of 20.0 will charge $12 per invoice.*/
			tax_percent?: number;
			/** optional, default is null
			Unix timestamp representing the end of the trial period the customer will get before being charged for the first time. If set, trial_end will override the default trial period of the plan the customer is being subscribed to. The special value now can be provided to end the customer's trial immediately.*/
			trial_end?: number;


		}): Promise<ISubscription>;

		/** Updates an existing subscription on a customer to match the specified parameters. When changing plans or quantities, we will optionally prorate the price we charge next month to make up for any price changes. To preview how the proration will be calculated, use the upcoming invoice endpoint.
		By default, we prorate subscription changes. For example, if a customer signs up on May 1 for a $10 plan, she'll be billed $10 immediately. If she then switches to a $20 plan on May 15, on June 1 she'll be billed $25 ($20 for a renewal of her subscription and a $5 prorating adjustment for the previous month). Similarly, a downgrade will generate a credit to be applied to the next invoice. We also prorate when you make quantity changes. Switching plans does not change the billing date or generate an immediate charge unless you're switching between different intervals (e.g. monthly to yearly), in which case we apply a credit for the time unused on the old plan and charge for the new plan starting right away, resetting the billing date. (Note that if we charge for the new plan, and that payment fails, the plan change will not go into effect).
If you'd like to charge for an upgrade immediately, just pass prorate as true as usual, and then invoice the customer as soon as you make the subscription change. That'll collect the proration adjustments into a new invoice, and Stripe will automatically attempt to pay the invoice.
If you don't want to prorate at all, set the prorate option to false and the customer would be billed $10 on May 1 and $20 on June 1. Similarly, if you set prorate to false when switching between different billing intervals (monthly to yearly, for example), we won't generate any credits for the old subscription's unused time, although we will still reset the billing date and bill immediately for the new subscription.
Returns
The newly updated subscription object if the call succeeded.
If a charge is required for the update, and the charge fails, this call throws an error, and the subscription update does not go into effect.
		*/
		updateSubscription(customerId: string, subscriptionId: string, options: {
			/** optional, default is null
A positive decimal (with at most two decimal places) between 1 and 100 that represents the percentage of the subscription invoice amount due each billing period (including any bundled invoice items) that will be transferred to the application owner’s Stripe account. The request must be made with an OAuth key in order to set an application fee percentage . For more information, see the application fees documentation.*/
			application_fee_percent?: number;
			/** optional, default is null
The code of the coupon to apply to the customer if you would like to apply it at the same time as updating the subscription.*/
			coupon?: string;
			/** optional
The identifier of the plan to update the subscription to. If omitted, the subscription will not change plans.*/
			plan?: string;
			/** optional, default is true
Flag telling us whether to prorate switching plans during a billing cycle.*/
			prorate?: boolean;
			/** optional, default is the current time
If set, the proration will be calculated as though the subscription was updated at the given time. This can be used to apply exactly the same proration that was previewed with upcoming invoice endpoint. It can also be used to implement custom proration logic, such as prorating by day instead of by second, by providing the time that you wish to use for proration calculations.*/
			proration_date?: number;
			metadata?: IMetadata;
			/** optional, default is 1
The quantity you'd like to apply to the subscription you're updating. For example, if your plan is $10/user/month, and your customer has 5 users, you could pass 5 as the quantity to have the customer charged $50 (5 x $10) monthly. If you update a subscription but don't change the plan ID (e.g. changing only the trial_end), the subscription will inherit the old subscription's quantity attribute unless you pass a new quantity parameter. If you update a subscription and change the plan ID, the new subscription will not inherit the quantity attribute and will default to 1 unless you pass a quantity parameter.*/
			quantity?: number;
			/** optional, default is null
The source can either be a token, like the ones returned by our Stripe.js, or a object containing a user's credit card details (with the options shown below). You must provide a source if the customer does not already have a valid source attached, and you are subscribing the customer for a plan that is not free. Passing source will create a new source object, make it the customer default source, and delete the old customer default if one exists. If you want to add an additional source to use with subscriptions, instead use the card creation API to add the card and then the customer update API to set it as the default. Whenever you attach a card to a customer, Stripe will automatically validate the card.*/
			source?: string;
			/** optional, default is null
Update the amount of tax applied to this subscription. Changing the tax_percent of a subscription will only affect future invoices.*/
			tax_percent?: number;

			/** optional, default is null
Unix timestamp representing the end of the trial period the customer will get before being charged for the first time. If set, trial_end will override the default trial period of the plan the customer is being subscribed to. The special value now can be provided to end the customer's trial immediately.*/
			trial_end?: number;






		}): Promise<ISubscription>;

    }


	invoices: {
		/** Retrieves the invoice with the given ID.
Returns an invoice object if a valid invoice ID was provided. Throws an error otherwise.
The invoice object contains a lines hash that contains information about the subscriptions and invoice items that have been applied to the invoice, as well as any prorations that Stripe has automatically calculated. Each line on the invoice has an amount attribute that represents the amount actually contributed to the invoice’s total. For invoice items and prorations, the amount attribute is the same as for the invoice item or proration respectively. For subscriptions, the amount may be different from the plan’s regular price depending on whether the invoice covers a trial period or the invoice period differs from the plan’s usual interval.
The invoice object has both a subtotal and a total. The subtotal represents the total before any discounts, while the total is the final amount to be charged to the customer after all coupons have been applied.
The invoice also has a next_payment_attempt attribute that tells you the next time (as a Unix timestamp) payment for the invoice will be automatically attempted. For invoices that have been closed or that have reached the maximum number of retries (specified in your retry settings), the next_payment_attempt will be null.*/
		retrieve(invoice: string): Promise<IInvoice>;
		/** When retrieving an invoice, you'll get a lines property containing the total count of line items and the first handful of those items. There is also a URL where you can retrieve the full (paginated) list of line items.
		FULL DEFINITION NOT IMPLEMENTED.  
		*/
		retrieveLines(invoice: string, options: {
			/**In the case of upcoming invoices, the customer of the upcoming invoice is required. In other cases it is ignored.*/
			customer?: string;
			ending_before?: string;
			/** The maximum number of line items to return*/
			limit?: number;
			/** In the case of upcoming invoices, the subscription of the upcoming invoice is optional. In other cases it is ignored.*/
			subscription?: string;
			subscription_plan?: string;
		}, callback: (err: Error, lines: IList<IInvoiceLineItem>) => void): void;
		/** You can list all invoices, or list the invoices for a specific customer. The invoices are returned sorted by creation date, with the most recently created invoices appearing first.*/
		list(options: {
			/** The identifier of the customer whose invoices to return. If none is provided, all invoices will be returned.*/
			customer?: string;
			/** A filter on the list based on the object date field. The value can be a string with an integer Unix timestamp, or it can be a dictionary with the following options:*/
			date?: number | { gt?: number; gte?: number; lt?: number; lte?: number; };
			/** optional, default is 10
A limit on the number of objects to be returned. Limit can range between 1 and 100 items.*/
			limit?: number;
		}): Promise<IList<IInvoice>>;
	}

}