import axios from 'axios'

const WHATSAPP_API_URL = 'https://graph.facebook.com/v22.0'
const PHONE_NUMBER_ID = '616008081606840'
const ACCESS_TOKEN = 'EAARzZAcAscRcBOZBvwZCAdFZCKPArdzuQ2QIGSHmFGWkuqgMUYpqC5HErOtusgn0EHq05rsZAX5JBBdwtkx8GK3UZCDv6pkwAlEiZAJ7W2w0VSkZBCbQhhDGTb5fmPgICGHOCJMzvKt9jMJxIeMxA0h3hcWCBoL781ZBQwmGDQzXTmpd6H0uaRDe3YqRnjsl9GL2rCAZDZD'

export function useOtpSender() {
  const sendOtpViaWhatsApp = async (numero, codigo) => {
    console.log(numero, codigo)
    const payload = {
      messaging_product: 'whatsapp',
      to: `258${numero}`,
      type: 'template',
      template: {
        name: 'auth',
        language: {
          code: 'pt_PT'
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: `${codigo}`
              }
            ]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [
              {
                type: 'text',
                text: `${codigo}`
              }
            ]
          }
        ]

      }
    }

    try {
      const response = await axios.post(
        `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Erro ao enviar OTP via WhatsApp:', error.response?.data || error.message)
      throw error
    }
  }

  return {
    sendOtpViaWhatsApp
  }
}
