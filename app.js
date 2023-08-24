const net = require('net');
const FileSystem =  require('fs');
const { log } = require('console');
const { v4: uuidv4 } = require('uuid');

const date = new Date().toString();
const password = 'Admin';
const port = 3001;


let serverSide = net.createServer((clientSide) => {
    clientSide.write(`Welcome to our Message Board\n`);

    const clientUsername = `user${uuidv4()}`;
    clientSide.write(`Username is ${clientUsername}\n`);
    clientSide.username = clientUsername
    console.log(`${clientSide.username} has connected\n`);

    activeClients.push(clientSide)

    for( const activeClient of activeClients) {
        if (activeClient !== clientSide) {
            activeClient.write(`${clientSide.username} has Entered the Message Board\n\n`);
        }
    }

    FileSystem.writeFile(
        './chat.log', 
        `(${date})// ${clientSide.username} has Entered the Message Board\n\n`, 
        {flag: 'a'}, 
        (error) => { if(error) throw error}
    );
    
    clientSide.setEncoding('utf8');
    clientSide.on('data', (messagePackage) => {
        console.log(`Client Data: ${messagePackage}`);

        //Command Call Names
        const whisperTo = 'w';
        const changeName = 'c';
        const kickUser = 'k';
        const userList = 'l';
        const commandsList = ['/w - Whisper\n' + '/c - Change Name\n' + '/k - Kick User\n' + '/l - User List\n' + '/howTo - Command Syntax\n\n'];
        const commandSyntax = ['/w <target> <message>\n' + '/c <new-username>\n' + '/k <target> <admin-password>\n' + '/l <empty>\n\n']
        const splitCommand = messagePackage.trim().split(' ');

        //Command Logic Functions
        if (messagePackage.startsWith(`/`)) {

            //Command: Whisper to another user
            if(messagePackage.startsWith(`/${whisperTo}`)) {
                const recievingUser = activeClients.find(
                    (activeClient) => activeClient.username === splitCommand[1]
                );
                FileSystem.writeFile(
                    './chat.log', 
                    `(${date})// ${clientSide.username} said: ${messagePackage}`,
                    {flag: 'a'},
                    (error) => { if(error) throw error}
                )
                if(recievingUser) {
                    if(recievingUser.username !== clientSide.username) {

                        joinedCommand = splitCommand.splice(2).join(' ');

                        FileSystem.writeFile(
                            './chat.log',
                            `(${date})// ${messagePackage}\n\n`,
                            {flag: 'a'},
                            (error) => { if(error) throw error}
                        );
                        recievingUser.write(`${clientSide.username} whispered: ${joinedCommand}\n\n`);
                        return;

                    } else if (recievingUser.username === clientSide.username) {

                        FileSystem.writeFile(
                            './chat.log',
                            `(${date})// Error: Cannot whisper to self`,
                            {flag: 'a'},
                            (error) => { if(error) throw error}
                        );                    
                        clientSide.write(`Error: Cannot whisper to self`);
                        return;    

                    } else {

                        clientSide.write(`Error: Invalid user entered -- ${joinedCommand[1]} dose not exist\n\n`);
                        FileSystem.writeFile(
                            './chat.log',
                            `(${date})// Error: Invalid user entered -- ${joinedCommand[1]} dose not exist\n\n`,
                            {flag: 'a'},
                            (error) => { if(error) throw error}
                        );

                    return;
                    };
                    
                };
            };

            //Command: Change user's name
            if(messagePackage.startsWith(`/${changeName}`)) {
                if(splitCommand.length !== 2) {
                    FileSystem.writeFile(
                        './chat.log', 
                        `(${date})// Error: Incorret Format Entered: plase try '/c <new usernane>'\n\n`, 
                        {flag: 'a'}, 
                        (error) => { if(error) throw error}
                    );
                    return clientSide.write(`Error: Incorret Format Entered: plase try '/c <new usernane>'`);
                }
                for (const activeClient of activeClients) {
                    // console.log(activeClient.username);
                    if(activeClient !== clientSide) {
                        if(splitCommand[1] === activeClient.username) {
                            FileSystem.writeFile(
                                './chat.log', 
                                `(${date})// Error: Entered username is already in use\n\n`, 
                                {flag: 'a'}, 
                                (error) => { if(error) throw error}
                            );
                            return clientSide.write(`Error: Entered username is already in use\n\n`)
                        };
                    } 
                    
                };
                if(splitCommand[1] === clientSide.username) {
                        FileSystem.writeFile(
                            './chat.log', 
                            `(${date})// Error: New username cannot be the same as old username\n\n`, 
                            {flag: 'a'}, 
                            (error) => { if(error) throw error}
                        );
                        return clientSide.write(`Error: New username cannot be the same as old username\n\n`) 
                } else {
                    FileSystem.writeFile(
                        './chat.log', 
                        `(${date})// ${clientSide.username} was changed to ${splitCommand[1]}\n\n`, 
                        {flag: 'a'}, 
                        (error) => { if(error) throw error}
                    );      
                    clientSide.write(`Your new username is: ${splitCommand[1]}`);
                    for (const activeClient of activeClients) {
                        if (activeClient !== clientSide) {
                            activeClient.write(`${clientSide.username} has changed their username to: ${splitCommand[1]}\n\n`);
                        }; 
                    }
                    return (clientSide.username = splitCommand[1]);
                } 
            };

            //Command: Kick a user
            if(messagePackage.startsWith(`/${kickUser}`)) {
                console.log(splitCommand);
                targetUser = activeClients.find(
                    (activeClient) => activeClient.username === splitCommand[1]
                );
                console.log(targetUser.username);
                if(splitCommand.length !== 3) {
                    FileSystem.writeFile(
                        './chat.log',
                        `(${date})// Error: Incorrect Format Entered: Please try '/k <target> <admin-password>`,
                        {flag: 'a'},
                        (error) => { if(error) throw error}
                    );
                    return clientSide.write(`Error: Incorrect Format Entered: Please try '/k <target> <admin-password>`)
                };
                if(splitCommand[1] === clientSide.username) {
                    FileSystem.writeFile(
                        './chat.log',
                        `(${date})// Error: Invalid Target: ${clientSide.username} tried to kick ${splitCommand[1]}: You cannot kick yourself`,
                        {flag: 'a'},
                        (error) => { if(error) throw error}
                    );
                    return clientSide.write(`Error: Invalid Target: ${clientSide.username} tried to kick ${splitCommand[1]}: You cannot kick yourself`);
                };
                if(splitCommand[2] !== password) {
                   FileSystem.writeFile(
                        './chat.log',
                        `(${date})// Error: Invalid Credentials: User - ${clientSide.username} Password - ${splitCommand[2]}: This is an incorrect passowrd`,
                        {flag: 'a'},
                        (error) => { if(error) throw error}
                    ); 
                    return clientSide.write(`Error: Invalid Credentials: Please use an Admin password to complete action`);
                };
                if((targetUser) && splitCommand[2] === password) {
                    console.log(targetUser.username);
                    FileSystem.writeFile(
                        './chat.log',
                        `(${date})// Admin: ${clientSide.username} has kicked ${targetUser.username}`,
                        {flag: 'a'},
                        (error) => { if(error) throw error}
                    );
                    targetUser.write(`You have been removed from the Message Board by an Admin.\nPlease contact customer support if you believe this was a mistake.\nHave a wonderful day ${targetUser.username}!`);
                    return targetUser.end();
                } else {
                    return clientSide.write(`The user entered (${splitCommand[1]}): Does not Exist`)
                };
            };

            //Command: Display all active users
            if(messagePackage.startsWith(`/${userList}`)) {
                for (const activeClient of activeClients) {
                    clientSide.write(`${activeClient.username}\n`)
                }
                return;
            };

            if(messagePackage.startsWith('/help')) {
                clientSide.write(commandsList.toString());
                return;
            };

            if(messagePackage.startsWith('/howTo')) {
                clientSide.write(commandSyntax.toString())
                return;
            };

            return clientSide.write(`\nNo Commands Recognized\nHere is a list of commands:\n\n${commandsList.toString()}`)

        };


        for( const activeClient of activeClients) {
            if(activeClient !== clientSide) {
                activeClient.write(`${clientSide.username}: ${messagePackage}`);
            };
        };
        clientSide.write(`You said: ${messagePackage}`);
        FileSystem.writeFile(
            './chat.log',
            `(${date})// ${clientSide.username} said: ${messagePackage}\n\n`,
            {flag: 'a'},
            (error) => { if(error) throw error}
        );
    });

    clientSide.on('end', () => {
        for(const activeClient of activeClients) {
            if(activeClient !== clientSide) {
                activeClient.write(`${clientSide.username} has Left the Message Board\n`)
            };
        };

        console.log(`${clientSide.username} has disconnected\n`);
        FileSystem.writeFile(
            './chat.log',
            `(${date})// ${clientSide.username} has Left the Message Board\n`,
            {flag: 'a'},
            (error) => { if(error) throw error}
        );

        activeClients.splice(
            activeClients.findIndex(
                ({ clientSide: activeClient}) => activeClient === clientSide
            ), 1
        );
    });
});

const activeClients = [];

serverSide.listen(port, () => {
    console.log(`Server is live on port: ${port}`);
})


// Below was the first attepmt i made at completeing this project before knowing that net was required for completion.

// const express = require("express");
// const app = express();
// const http = require("http").createServer(app);
// const server = require("socket.io")(http);
// const fs = require('fs');

// const port = process.env.PORT || 3000;


// app.use(express.static("public"));

// server.on('connection', (client) => {-
//     console.log(`A user has connected`);
//     fs.writeFile('/Users/isaacmesser/Documents/development/school/node/node-projects/chat-server:client/chat.log', `--A User Has Connected--
// `, { flag: 'a+' }, err => {
//             if (err) {
//                 console.log(err);
//             }
//         });
    
//     client.on('disconnect', () => {
//         console.log(`User has disconnected`)
//         fs.writeFile('/Users/isaacmesser/Documents/development/school/node/node-projects/chat-server:client/chat.log', `--A User Has Disconnected--
// `, { flag: 'a+' }, err => {
//             if (err) {
//                 console.log(err);
//             }
//         })
//     })

//     client.on('sentServerMessage', (message) => {
//         server.emit('sentClientMessage', `${message.sender}:  ${message.text}`)
//         fs.writeFile('/Users/isaacmesser/Documents/development/school/node/node-projects/chat-server:client/chat.log', `${message.sender}:  ${message.text}
// `, { flag: 'a+' }, err => {
//             if (err) {
//                 console.log(err);
//             }
//         })
//     });
// });

// http.listen(port, () => {
//     console.log(`Server is live on port: ${port}`);
// })