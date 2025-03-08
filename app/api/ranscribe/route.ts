import { NextResponse } from 'next/server';
import { createSignature, callTencentAPI } from './tencent-utils';

export async function POST(request: Request) {
  try {
    const { audioData, messageId } = await request.json();

    // 调用语音识别API
    const asrResponse = await callTencentAPI({
      endpoint: "asr.tencentcloudapi.com",
      service: "asr",
      action: "SentenceRecognition",
      version: "2019-06-14",
      payload: {
        UsrAudioKey: messageId,
        SubServiceType: 2,
        ProjectId: 0,
        EngSerViceType: "16k_en",
        VoiceFormat: "wav",
        Data: audioData,
        SourceType: 1
      }
    });

    const asrData = await asrResponse.json();
    if (!asrData.Response?.Result) {
      return NextResponse.json({ error: asrData.Response?.Error?.Message || '语音识别失败' }, { status: 500 });
    }

    // 调用翻译API
    try {
      const translateResponse = await callTencentAPI({
        endpoint: "tmt.tencentcloudapi.com",
        service: "tmt",
        action: "TextTranslate",
        version: "2018-03-21",
        region: "ap-guangzhou",
        payload: {
          SourceText: asrData.Response.Result,
          Source: "en",
          Target: "zh",
          ProjectId: 0
        }
      });

      const translateData = await translateResponse.json();
      if (translateData.Response?.TargetText) {
        return NextResponse.json({ 
          result: asrData.Response.Result,
          translation: translateData.Response.TargetText 
        });
      }
    } catch (error) {
      console.error('Translation failed:', error);
    }

    return NextResponse.json({ 
      result: asrData.Response.Result
    });
  } catch (error: any) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
