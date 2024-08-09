const { Client } = require('@stomp/stompjs');
const WebSocket = require('ws');
const fs = require('fs'); // 파일 시스템 모듈

const STOMP_BROKER_URL = 'ws://43.201.255.171:80/ws'; // 웹소켓 주소
const logFilePath = './response_times.log'; // 로그 파일 경로

const clients = [];
const publishTimes = {};

// STOMP 클라이언트 생성 및 설정 함수
const createStompClient = (clientId) => {
    return new Promise((resolve, reject) => {
        const client = new Client({
            brokerURL: STOMP_BROKER_URL,
            connectHeaders: {
                login: 'guest', // RabbitMQ의 기본 계정
                passcode: 'guest'
            },
            webSocketFactory: () => {
                return new WebSocket(STOMP_BROKER_URL);
            },
            onConnect: () => {
                console.log(`Client ${clientId} connected.`);

                client.subscribe(`/exchange/chat.exchange/roomId.${clientId}`, (message) => {
                    try {
                    console.log(`Client ${clientId} Received : ${message.body}`)
                    const now = new Date();
                    const responseTime = now - publishTimes[clientId];
                    
                    // 로그 파일에 기록
                    const logEntry = `Client ${clientId}, Pub-Sub Delay: ${responseTime} ms\n`;
                    fs.appendFile(logFilePath, logEntry, (err) => {
                        if (err) throw err;
                    });

                    // Manual ACK 전송
                    message.ack();
                    } catch (e) { console.log(e); }
                }, { ack: 'client' });
                
                resolve(client); // 구독 완료 후 resolve 호출
            },
            onStompError: (frame) => {
                console.error(`Client ${clientId} encountered an error: `, frame);
                reject(frame);
            }
        });

        client.activate();
    });
};

const disconnect = (clientId) => {
    clients[clientId].deactivate(() => {
        console.log(`Client ${clientId} Disconnected`);
    });
}

// 메시지를 전송하고 수신하는 테스트 함수
const testClient = async (clientId) => {
    try {
        const client = await createStompClient(clientId);

        // 클라이언트가 활성화된 후에 메시지를 전송
        setTimeout(() => {
            client.publish({
                destination: `/app/message/${clientId}`,
                body: JSON.stringify({
                    "seq": 0,
                    "senderName": "kim",
                    "message": "hello worldhello worldhello worldhello worldhello worldhello worldhello worldhello world"
                })
            });
            publishTimes[clientId] = new Date(); // 전송 시간을 기록
        }, 3000);
        
    } catch (error) {
        console.error(`Error with client ${clientId}:`, error);
    }
}

// 여러 클라이언트를 생성하여 테스트 실행
async function runTest(cnt) {
    for(let i=0; i<cnt; i++) {
        const clientId = i+1;
        const c = await createStompClient(clientId);
        setTimeout(() => {
            c.publish({
                destination: `/app/message/${clientId}`,
                body: JSON.stringify({
                    "seq": 0,
                    "senderName": "kim",
                    "message": "hello worldhello worldhello worldhello worldhello worldhello worldhello worldhello world"
                })
            });
            publishTimes[clientId] = new Date(); // 전송 시간을 기록
        }, 3000);
    }




    // const clients = [];
    // for(let i = 0; i < cnt; i++) {
    //     clients.push(testClient(i + 1));
    // }
    // await Promise.all(clients);
    // console.log('All clients have finished.');
}

// 테스트 실행 (예: 1개의 클라이언트)
runTest(100);
