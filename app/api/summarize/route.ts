import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { SummarizeResponse } from '@/types';
import { validateSummarizeData } from '@/app/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, content } = body;

    // 입력 검증 및 보안 (유틸리티 함수 사용)
    const validation = validateSummarizeData({ title, description, content });
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    const { title: trimmedTitle, description: trimmedDescription, content: trimmedContent } = validation.sanitizedData!;

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // OpenAI 클라이언트 초기화
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // 요약할 텍스트 준비
    const textToSummarize = trimmedContent 
      ? `제목: ${trimmedTitle}\n\n내용: ${trimmedDescription}\n\n상세: ${trimmedContent}`
      : `제목: ${trimmedTitle}\n\n내용: ${trimmedDescription}`;

    try {
      // GPT-4o-mini 모델을 사용하여 요약 생성
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 뉴스 요약 전문가입니다. 주어진 뉴스 기사를 2-3문장으로 간결하고 명확하게 요약해주세요. 핵심 내용과 중요한 정보만 포함하여 한국어로 답변해주세요.'
          },
          {
            role: 'user',
            content: textToSummarize
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
      });

      const summary = completion.choices[0]?.message?.content?.trim();

      if (!summary) {
        return NextResponse.json(
          { success: false, error: '요약을 생성할 수 없습니다.' },
          { status: 500 }
        );
      }

      const response: SummarizeResponse = {
        success: true,
        summary,
      };

      return NextResponse.json(response);

    } catch (openaiError: any) {
      console.error('OpenAI API 에러:', openaiError);

      // 상세한 에러 처리
      if (openaiError.status === 429) {
        return NextResponse.json(
          { success: false, error: 'API 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        );
      } else if (openaiError.status === 401) {
        return NextResponse.json(
          { success: false, error: 'API 인증에 실패했습니다.' },
          { status: 401 }
        );
      } else if (openaiError.status === 400) {
        return NextResponse.json(
          { success: false, error: '요청 형식이 올바르지 않습니다.' },
          { status: 400 }
        );
      } else if (openaiError.status === 403) {
        return NextResponse.json(
          { success: false, error: 'API 접근이 거부되었습니다.' },
          { status: 403 }
        );
      } else if (openaiError.status === 503) {
        return NextResponse.json(
          { success: false, error: 'AI 서비스가 일시적으로 사용할 수 없습니다.' },
          { status: 503 }
        );
      } else if (openaiError.code === 'ECONNABORTED') {
        return NextResponse.json(
          { success: false, error: '요청 시간이 초과되었습니다.' },
          { status: 408 }
        );
      } else if (openaiError.code === 'ENOTFOUND' || openaiError.code === 'ECONNREFUSED') {
        return NextResponse.json(
          { success: false, error: 'AI 서비스에 연결할 수 없습니다.' },
          { status: 503 }
        );
      } else if (openaiError.status >= 500) {
        return NextResponse.json(
          { success: false, error: 'AI 서비스에 일시적인 문제가 발생했습니다.' },
          { status: 503 }
        );
      }

      // 기타 OpenAI API 에러
      return NextResponse.json(
        { success: false, error: '요약 생성 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('요약 API 에러:', error);
    return NextResponse.json(
      { success: false, error: '요약 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}