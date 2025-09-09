// Verify the payment using stripe webhooks , update the booking my marking as paid
import stripe from 'stripe'
import Booking from '../models/Booking.js';


// When stripe send a webhook req , it contains a special headers called stripe-signature , that includes timestamp, and HMAC-SHA sign
// How stripe generates that sign
// First creates a payload = timestamp + "." + raw_req_body
// HMAC(secret=STRIPE_WEBHOOK_SECRET, data=signed_payload, algo=SHA256)
// Encode the result in hex → that’s the v1=... you see in the header.

// We have the same webhook secret on the server so we repeats the exact same hashing process with your copy of STRIPE_WEBHOOK_SECRET.If the hash you calculate matches one of the signatures Stripe sent (v1, v0, etc.), the webhook is authentic. If not → verification fails (maybe tampered request, or wrong secret).


export const stripeWebhooks = async (req, res) => {
    // create stripe instance
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sign = req.headers['stripe-signature'];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(req.body, sign, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        response.status(400).send(`Webhook Error: ${err.message}`);//If verification fails → return HTTP 400 with an error message (Webhook Error).
    }

    // event will contain validated event data 
    if (event.type === "payment_intent.succeeded") {  // it will run when stripe has confirmed payment
        // get the payment intent object(contains payment details) from the event data
        const paymentIntent = event.data.object;
        const { id: paymentIntentId } = paymentIntent

        // Fetch the checkout session linked with this payment intent, we have stored metadata while creating the session
        const session = await stripeInstance.checkout.sessions.list({
            payment_intent: paymentIntentId
        })
        const { bookingId } = session.data[0].metadata;
        // Mark Payment as Paid
        await Booking.findByIdAndUpdate(
            bookingId,
            { isPaid: true, paymentMethod: "Stripe" }
        );
    }else{
        console.log("Unhandled event type :",event.type)
    }

    res.json({recieved:true})// this response will be sent to stripe to let them know that the webhook is successfully recieved 

}