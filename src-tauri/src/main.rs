#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use reqwest::{redirect::Policy, Client, Url};
use serde::{Deserialize, Serialize};
use std::time::Duration;

const MAX_RESPONSE_BYTES: usize = 2 * 1024 * 1024;

#[derive(Serialize)]
struct AiResponse {
    status: u16,
    body: String,
}

#[derive(Clone, Copy, Deserialize)]
#[serde(rename_all = "kebab-case")]
enum AiProtocol {
    OpenaiResponses,
    AnthropicMessages,
    OpenaiChat,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
enum AiRequestError {
    InvalidEndpoint,
    TimedOut,
    Network,
    ResponseTooLarge,
}

impl From<reqwest::Error> for AiRequestError {
    fn from(error: reqwest::Error) -> Self {
        if error.is_timeout() {
            Self::TimedOut
        } else {
            Self::Network
        }
    }
}

#[tauri::command]
async fn send_ai_request(
    endpoint: String,
    api_key: String,
    protocol: AiProtocol,
    payload: serde_json::Value,
    timeout_ms: u64,
) -> Result<AiResponse, AiRequestError> {
    let url = Url::parse(&endpoint).map_err(|_| AiRequestError::InvalidEndpoint)?;
    let expected_path = match protocol {
        AiProtocol::OpenaiResponses => "/responses",
        AiProtocol::AnthropicMessages => "/messages",
        AiProtocol::OpenaiChat => "/chat/completions",
    };
    if !matches!(url.scheme(), "http" | "https")
        || !url.has_host()
        || !url.username().is_empty()
        || url.password().is_some()
        || url.fragment().is_some()
        || !url.path().ends_with(expected_path)
    {
        return Err(AiRequestError::InvalidEndpoint);
    }

    let client = Client::builder().redirect(Policy::none()).build()?;
    let request = client
        .post(url)
        .timeout(Duration::from_millis(timeout_ms.clamp(1, 60_000)))
        .json(&payload);
    let request = match protocol {
        AiProtocol::AnthropicMessages => request
            .header("x-api-key", api_key)
            .header("anthropic-version", "2023-06-01"),
        _ => request.bearer_auth(api_key),
    };
    let mut response = request.send().await?;
    let status = response.status().as_u16();
    let mut body = Vec::new();
    while let Some(chunk) = response.chunk().await? {
        if body.len() + chunk.len() > MAX_RESPONSE_BYTES {
            return Err(AiRequestError::ResponseTooLarge);
        }
        body.extend_from_slice(&chunk);
    }

    Ok(AiResponse {
        status,
        body: String::from_utf8_lossy(&body).into_owned(),
    })
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_ai_request])
        .run(tauri::generate_context!())
        .expect("failed to start 拾序");
}
