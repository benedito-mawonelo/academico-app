export function useOtpSenderTwilio() {
  const sendOtpViaTwilio = async (numero, codigo) => {
    try {
      const response = await fetch('https://otp-sender-sms.vercel.app/api/sendOtp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          numero,
          codigo
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao enviar SMS')
      }

      console.log('SMS enviado com sucesso:', data)
      return data
    } catch (error) {
      console.error('Erro ao enviar OTP ia SMS:', error)
      throw error
    }
  }

  return {
    sendOtpViaTwilio
  }
}
