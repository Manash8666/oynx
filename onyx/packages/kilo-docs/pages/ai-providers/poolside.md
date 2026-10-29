---
title: "Using Poolside with Onyx"
description: "Connect Poolside models to Onyx. Guide to getting a Poolside Platform API key and setting up the built-in Poolside provider in VS Code and the CLI."
sidebar_label: Poolside
---

# Using Poolside With Onyx

Onyx supports accessing Poolside's Laguna models directly through Poolside Platform.

**Website:** [https://poolside.ai/](https://poolside.ai/)

{% callout type="tip" %}
Poolside models are also available through [Kilo Gateway](/docs/gateway). Free models require no authentication; paid models use your Kilo account — see [Authentication](/docs/getting-started/setup-authentication) to sign in, and [Kilo Gateway authentication](/docs/gateway/authentication) for how the Gateway handles free and paid access.
{% /callout %}

## Getting an API Key

1. **Sign Up/Sign In:** Go to [Poolside Platform](https://platform.poolside.ai/). Create an account or sign in.
2. **Open API Keys:** Open **API Keys**.
3. **Create a key:** Click **New key**.
4. **Copy the key:** Copy the key and store it securely.

## Configuration in Onyx

Poolside is available as a **built-in provider** in Onyx, so you can connect it directly — no custom provider setup needed.

{% tabs %}
{% tab label="VSCode" %}

Open **Settings** (gear icon) and go to the **Providers** tab. Click **Show more providers**, then search for and select **Poolside** and enter your API key.

{% /tab %}
{% tab label="CLI" %}

Run `kilo`, then use the `/connect` command, search for and select **Poolside**, and enter your API key when prompted:

```bash
kilo
# then, inside Kilo, run:
/connect
```

{% /tab %}
{% /tabs %}

Kilo stores the API key in its `auth.json` credential store.

## Tips and Notes

- **Models:** See [Poolside supported models](https://docs.poolside.ai/get-started/supported-models) for capabilities and context windows. Use the [`/models` endpoint](https://docs.poolside.ai/api/openai-api-examples) for current model IDs.
- **API:** Onyx connects to Poolside through the OpenAI-compatible API at `https://inference.poolside.ai/v1`. See the [Poolside API documentation](https://docs.poolside.ai/api/overview).
