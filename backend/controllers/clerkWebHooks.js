import {Webhook} from 'svix'
import User from '../models/User';
// svix is a webhook service that clerk uses to send webhooks events securely


// We are using svix library to verify signatures for secure processing of clerk webhooks, so that there are not fake webhook requests

// async function - main webhook handler that will recieve webhook requests
const clerkWebHooks = async (req,res) => {
    try {
        // creating a webhook instance by passing the secret, this secret is used to verify the request that it really comes from clerk
        // this instance is just a verifier to check the sign(coming in the request)
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

        // svix webhook req are signed , there are 3 special headers in the request i.e id, timestamp, sign, and this sign  is used to verify , we need to extract them
        const headers={
            'svix-id':req.headers['svix-id'],
            'svix-timestamp':req.headers['svix-timestamp'],
            'svix-signature':req.headers['svix-signature'],
        }

        await whook.verify(JSON.stringify(req.body),headers);  
        // what this verify will do?
        // 1. it will recreate the signed content = 'id.timestamp.body'
        // 2. put it in a algo alongwith secret to generate a sign
        // 3. Compare signatures:The svix-signature header from Clerk actually contains one or more base64-encoded signatures. Webhook.verify() decodes them and checks:
        // 4.If the recalculated signature matches → the webhook is valid (came from Clerk).



        //Getting data from req body
        const {data,type} = req.body;
        
        const userData = {
            _id:data.id,
            email:data.email_addresses[0].email_address,
            username:data.first_name + " "+data.last_name,
            image:data.image_url

        }

        // in the type we will get the events , so we will add a switch case for different events

        switch(type){
            case "user.created":{
                await User.create(userData);
                break;
            }
            case "user.updated":{
                await User.findByIdAndUpdate(data.id,userData);
                break;
            }
            case "user.deleted":{
                await User.findByIdAndDelete(data.id);
                break;
            }
            default: 
                break;
        }

        res.json({success:true,message:"Webhook Recieved"})


    } catch (error) {
        console.log(error.message)
        res.json({success:false,message:error.message})

    }
}

export default clerkWebHooks