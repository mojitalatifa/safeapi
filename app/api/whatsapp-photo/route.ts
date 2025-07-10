import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log("🔍 API /whatsapp-photo chamada");

  try {
    const { phone } = await request.json();
    console.log("📱 Phone recebido:", phone);

    if (!phone) {
      console.log("❌ Phone vazio");
      return NextResponse.json(
        { success: false, error: "Número de telefone é obrigatório" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    console.log("🧹 Phone limpo:", cleanPhone);

    // Valida o número (mínimo de 10 dígitos, incluindo código do país)
    if (cleanPhone.length < 10) {
      console.log("❌ Número inválido: menos de 10 dígitos");
      return NextResponse.json(
        { success: false, error: "Número de telefone inválido: deve conter pelo menos 10 dígitos" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Adiciona código do país se não tiver (assumindo Brasil +55)
    let fullNumber = cleanPhone;
    if (!cleanPhone.startsWith("55") && cleanPhone.length === 11) {
      fullNumber = "55" + cleanPhone;
    }
    console.log("🌍 Número completo:", fullNumber);

    const apiUrl = `https://primary-production-aac6.up.railway.app/webhook/request_photo?tel=${fullNumber}`;
    console.log("🔗 URL da API:", apiUrl);

    const maxRetries = 2;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`🌐 Tentativa ${attempt + 1} de fetch para API externa...`);
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Origin: "https://whatspy.chat",
          },
          signal: AbortSignal.timeout?.(10000), // Timeout de 10 segundos, como no projeto funcional
        });

        console.log("📡 Response status:", response.status, "ok:", response.ok);

        if (!response.ok) {
          let errorText;
          try {
            const errorData = await response.json();
            errorText = JSON.stringify(errorData);
          } catch {
            errorText = await response.text();
          }
          console.error("❌ API externa retornou erro:", response.status, errorText);
          throw new Error(`Falha na API externa: ${response.status} - ${errorText}`);
        }

        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error("❌ Erro ao parsear JSON:", jsonError);
          return NextResponse.json(
            {
              success: false,
              error: "Resposta inválida da API externa",
              result: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
              is_photo_private: true,
            },
            { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
          );
        }

        console.log("📄 Data recebida:", data);

        const isPhotoPrivate = !data?.link || data.link.includes("no-user-image-icon");
        console.log("🔒 Foto privada:", isPhotoPrivate);

        const result = {
          success: true,
          result: isPhotoPrivate
            ? "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="
            : data.link,
          is_photo_private: isPhotoPrivate,
        };
        console.log("✅ Retornando sucesso:", result);

        return NextResponse.json(result, {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      } catch (fetchError: any) {
        attempt++;
        if (attempt === maxRetries) {
          console.error("💥 Todas as tentativas falharam:", fetchError.message);
          return NextResponse.json(
            {
              success: false,
              error: `Não foi possível consultar a foto do perfil: ${fetchError.message}`,
              result: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
              is_photo_private: true,
            },
            { status: 502, headers: { "Access-Control-Allow-Origin": "*" } }
          );
        }
        console.log(`🔄 Tentando novamente (tentativa ${attempt + 1})...`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (err: any) {
    console.error("💥 Erro geral:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: `Erro interno do servidor: ${err.message}`,
        result: "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=",
        is_photo_private: true,
      },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
