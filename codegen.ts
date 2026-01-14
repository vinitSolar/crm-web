import type { CodegenConfig } from '@graphql-codegen/cli';
import * as dotenv from 'dotenv';
dotenv.config();

const config: CodegenConfig = {
    // Schema URL for codegen - override via CLI if needed: --schema <url>
    schema: (process.env.VITE_API_URL || 'http://localhost:4000') + '/graphql',
    documents: ['src/**/*.{ts,tsx}'],
    generates: {
        './src/graphql/generated/': {
            preset: 'client',
            presetConfig: {
                gqlTagName: 'gql',
            },
            config: {
                useTypeImports: true,
                enumsAsTypes: true,
                scalars: {
                    DateTime: 'string',
                    JSON: 'Record<string, unknown>',
                },
            },
        },
    },
    ignoreNoDocuments: true,
};

export default config;
