Artificial Analysis API Documentation (Free API)
Overview & Access
Artificial Analysis provides a free API to support analysis of AI models and in making informed decisions about which AI models to use.
We offer a free API focused on model benchmarks and a commercial API with more comprehensive data. Commercial API documentation is available to partners separately.

To access our free API, create an account for the Artificial Analysis Insights Platform and generate an API key.

When integrating with our API, we recommend using model and creator IDs as primary identifiers since they remain stable, while slugs and names may change over time.

Attribution & Sharing of Data
Attribution is required for all use of our free API. Please provide attribution to https://artificialanalysis.ai/.

If you wish to include our logo in your materials, you can download our brand kit here: Artificial Analysis Brand Kit.

Methodology
For details on how benchmarks are conducted, see our methodology.

Authentication
Include your API key in the x-api-key header.

To obtain an API key, create an account in the Artificial Analysis Insights Platform and generate an API key.

401 Invalid/missing API key
429 Rate limit exceeded
500 Internal server error
Free Artificial Analysis Data API
Our free API is focused on sharing primary metrics from our independent benchmarks of models. This includes our independent intelligence evaluations, speed benchmarks and pricing.

The API is rate-limited to 1,000 requests per day. To avoid publicly sharing keys and rate limits, please do not include in client side code and cache responses.

LLMs Endpoint
get/data/llms/models
Response Fields
Field	Type	Description
id	string	Unique identifier (stable)
name	string	Full name (may change)
slug	string	URL-friendly identifier (infrequently changed)
model_creator	object	Creator information (id, name, slug)
evaluations	object	Benchmark scores
pricing	object	Price per million tokens ($USD)
median_output_tokens_per_second	number	Output generation speed (tokens per second)
median_time_to_first_token_seconds	number	Time to first token (seconds)
Example Request
curl -X GET https://artificialanalysis.ai/api/v2/data/llms/models \
          -H "x-api-key: your_api_key_here"
Example Response
{
  "status": 200,
  "prompt_options": {
    "parallel_queries": 1,
    "prompt_length": "medium"
  },
  "data": [
    {
      "id": "2dad8957-4c16-4e74-bf2d-8b21514e0ae9",
      "name": "o3-mini",
      "slug": "o3-mini",
      "model_creator": {
        "id": "e67e56e3-15cd-43db-b679-da4660a69f41",
        "name": "OpenAI",
        "slug": "openai"
      },
      "evaluations": {
        "artificial_analysis_intelligence_index": 62.9,
        "artificial_analysis_coding_index": 55.8,
        "artificial_analysis_math_index": 87.2,
        "mmlu_pro": 0.791,
        "gpqa": 0.748,
        "hle": 0.087,
        "livecodebench": 0.717,
        "scicode": 0.399,
        "math_500": 0.973,
        "aime": 0.77
      },
      "pricing": {
        "price_1m_blended_3_to_1": 1.925,
        "price_1m_input_tokens": 1.1,
        "price_1m_output_tokens": 4.4
      },
      "median_output_tokens_per_second": 153.831,
      "median_time_to_first_token_seconds": 14.939,
      "median_time_to_first_answer_token": 14.939
    },
    // Other models...
  ]
}