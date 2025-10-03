import { defineConfig } from "vocs";

export default defineConfig({
    title: "Tempo",
    description: "Documentation for Tempo testnet and protocol specifications",
    logoUrl: {
        light:
            "https://raw.githubusercontent.com/tempoxyz/.github/refs/heads/main/assets/combomark-bright.svg",
        dark:
            "https://raw.githubusercontent.com/tempoxyz/.github/refs/heads/main/assets/combomark-dark.svg",
    },
    socials: [
        {
          icon: "github",
          link: "https://github.com/tempoxyz",
        },
        {
          icon: "x",
          link: "https://twitter.com/tempo",
        },
      ],
    sidebar: {
         "/testnet": [
             {
                 text: "Overview",
                 link: "/testnet",
             },
             {
                 text: "Lento",
                 link: "/testnet/lento",
             },
             {
                 text: "Adagietto",
                 link: "/testnet/adagietto",
             },
             {
                 text: "Adagio",
                 link: "/testnet/adagio",
             },
         ],
         "/litepaper": [
             {
                 text: "Overview",
                 link: "/litepaper",
             },
             {
                 text: "Motivation",
                 link: "/litepaper/motivation",
             },
             {
                text: "Neutrality",
                link: "/litepaper/neutrality",
            },
            {
                text: "Payments",
                link: "/litepaper/payments",
            },
            {
                text: "Privacy",
                link: "/litepaper/privacy",
            },
            {
                text: "Performance",
                link: "/litepaper/performance",
            },
            {
                text: "Use Cases",
                link: "/litepaper/use-cases",
            },
         ],
        "/documentation": [
            {
                text: "Overview",
                link: "/documentation",
            },
            {
                text: "Library Setup",
                link: "/documentation/library-setup",
            },
            {
                text: "FAQ",
                link: "/documentation/faq",
            },
            {
                text: "Tokens",
                items: [
                    {
                        text: "Overview",
                        link: "/documentation/tokens",
                    },
                    {
                        text: "Deployment",
                        link: "/documentation/tokens/deployment",
                    },
                    {
                        text: "Roles & Permissions",
                        link: "/documentation/tokens/roles",
                    },
                    {
                        text: "Minting & Burning",
                        link: "/documentation/tokens/minting",
                    },
                    {
                        text: "Policies",
                        link: "/documentation/tokens/policies",
                    },
                ],
            },
            {
                text: "Transactions",
                items: [
                    {
                        text: "Fees",
                        link: "/documentation/transactions/fees",
                    },
                    {
                        text: "Payments Lane",
                        link: "/documentation/transactions/payments-lane",
                    }
                ],
            },
            {
                text: "Accounts",
                items: [
                    {
                        text: "Overview",
                        link: "/documentation/accounts",
                    },
                ],
            },
            {
                text: "Liquidity",
                items: [
                    {
                        text: "Fee AMM",
                        link: "/documentation/liquidity/fee-amm",
                    },
                ],
            },
            {
                text: "Consensus",
                items: [
                    {
                        text: "Overview",
                        link: "/documentation/consensus",
                    },
                ],
            }
        ],
         "/protocol": [
             {
                 text: "Overview",
                 link: "/protocol",
             },
             {
                text: "Github",
                link: "https://github.com/tempoxyz/specs",
             },
             {
                text: "Tokens",
                items: [
                    {
                        text: "Overview",
                        link: "/protocol/tokens",
                    },
                    {
                        text: "TIP-20",
                        link: "/protocol/tokens/tip-20",
                    },
                    {
                        text: "TIP-4217",
                        link: "/protocol/tokens/tip-4217",
                    },
                    {
                        text: "TIP-403",
                        link: "/protocol/tokens/tip-403",
                    },
                ],
            },
             {
                 text: "Transactions",
                 items: [
                     {
                         text: "Overview",
                         link: "/protocol/transactions",
                     },
                     {
                         text: "Token Preferences",
                         link: "/protocol/transactions/token-preferences",
                     },
                     {
                         text: "Fee AMM",
                         link: "/protocol/transactions/fee-amm",
                     },
                     {
                        text: "Payments Lane",
                        link: "/protocol/transactions/payments-lane",
                    },
                 ],
             },
            {
                text: "Accounts",
                items: [
                    {
                        text: "Overview",
                        link: "/protocol/accounts",
                    },
                ],
            },
        ],
    },
     topNav: [
         { text: "Testnet", link: "/testnet" },
         { text: "Documentation", link: "/documentation" },
         { text: "Protocol", link: "/protocol" },
         { text: "Litepaper", link: "/litepaper" },
     ],
});
