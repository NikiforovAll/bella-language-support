'use strict'

import * as LSP from 'vscode-languageserver'

import BellaServer from './server'

function listen() {

    const connection: LSP.IConnection = LSP.createConnection(LSP.ProposedFeatures.all);
    connection.onInitialize(
        (params: LSP.InitializeParams): Promise<LSP.InitializeResult> => {
            connection.console.log(`Initialized server for ${params.rootUri}`)

            return BellaServer.initialize(connection, params)
                .then(server => {
                    server.register(connection)
                    return server
                })
                .then(server => ({
                    capabilities: server.capabilities(),
                }))
        },
    )
    connection.listen()
};
//INDEX; let's spin up the Bella Language Server
listen();


//================================================================================

// Create a connection for the server.
// The connection uses stdin/stdout for communication.
// const connection: LSP.IConnection = LSP.createConnection(
//     new LSP.StreamMessageReader(process.stdin),
//     new LSP.StreamMessageWriter(process.stdout),
// )
// const connection: IConnection = createConnection(ProposedFeatures.all)

// connection.onInitialize(
//     async (params: InitializeParams): Promise<InitializeResult> => {
//         connection.console.info('BashLanguageServer initializing...')

//         const server = await BellaLanguageServer.initialize(connection, params)
//         server.register(connection)

//         connection.console.info('BashLanguageServer initialized')

//         return {
//             capabilities: server.capabilities(),
//         }
//     },
// )

// connection.listen()
