import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    // Verifikasi captcha ke Google ReCAPTCHA
    const captchaVerifyResponse = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY!, // Secret key dari Google
          response: token,
        }),
      }
    );

    const captchaVerifyResult = await captchaVerifyResponse.json();

    if (captchaVerifyResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Captcha verified successfully' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Captcha verification failed' 
      }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: error 
    }, { status: 500 });
  }
}
