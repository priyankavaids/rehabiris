import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeMedicalReport(base64Data: string, mimeType: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        {
          text: "Analyze this medical report/scan and extract the following information in JSON format: injury_area (e.g., knee, shoulder), surgery_type (if any), movement_restrictions, and a brief explanation of the injury for the patient.",
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            injury_area: { type: Type.STRING },
            surgery_type: { type: Type.STRING },
            movement_restrictions: { type: Type.STRING },
            explanation: { type: Type.STRING },
          },
          required: ["injury_area", "explanation"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}

export async function getRecoveryPrediction(exerciseData: any) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Based on the following exercise performance data: ${JSON.stringify(exerciseData)}, predict the recovery progress percentage and estimated days to full recovery. Return as JSON with keys: progress_percent (number), estimated_days (number), and suggestions (string).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            progress_percent: { type: Type.NUMBER },
            estimated_days: { type: Type.NUMBER },
            suggestions: { type: Type.STRING },
          },
          required: ["progress_percent", "estimated_days"],
        },
      },
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Prediction Error:", error);
    return { progress_percent: 50, estimated_days: 30, suggestions: "Keep practicing consistently." };
  }
}

export async function generateRecoveryVideo(imageBase64: string, prompt: string) {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || 'A person performing physical therapy exercises correctly',
      image: {
        imageBytes: imageBase64,
        mimeType: 'image/png',
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    return operation.response?.generatedVideos?.[0]?.video?.uri;
  } catch (error) {
    console.error("Video Generation Error:", error);
    return null;
  }
}

export async function searchRehabCenters(location: { lat: number, lng: number }) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Find 5 highly rated physiotherapy and rehabilitation centers near my location. Provide their names, addresses, and phone numbers.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: location.lat,
              longitude: location.lng
            }
          }
        }
      },
    });

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const text = response.text;
    
    return { text, chunks };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return null;
  }
}
