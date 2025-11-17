// SEND SMS FUNCTION USING TEXTSMS API

// Import Axios for making HTTP requests
import axios from 'axios'

const API_KEY = 'a38a7bd19037ca9ac753321df51ce6d8'
const PARTNER_ID = '12311'
const SHORT_CODE = 'TextSMS'
const API_URL = 'https://sms.textsms.co.ke/api/services/sendsms/'

// Function to send SMS
export const sendPhoneOTP = async (phoneNumber, otp) => {
    // Request payload to send SMS
    const data = {
        apikey: API_KEY,
        partnerID: PARTNER_ID,
        message: `Your Peace-Verse OTP is: ${otp} it expires in 5 minutes`, // The message content
        shortcode: SHORT_CODE,
        mobile: phoneNumber,
        route: 'transactional', // route: 'optional',
        country: 'KE',
        encoding: 'unicode',
        // You might need additional parameters like route, country code, etc.
    }

    // Send SMS using Axios
    // const sendTextsMessage = await axios
    await axios
        .post(API_URL, data)
        .then((response) => {
            console.log(`✅ OTP sent to ${phoneNumber}: ${otp}`);
            console.log('SMS sent successfully:', response.data)
        })
        .catch((error) => {
            console.error(
                'Error sending SMS:',
                error.response ? error.response.data : error.message
            )
        })

    // return sendTextsMessage
}

// // Example usage
// sendSMS('254719284286',290983)
