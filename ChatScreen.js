import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, TouchableHighlight, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import io from 'socket.io-client';
import Config from './config';

const socket = io(Config.BACKEND_URL);

const Message = ({ message, sender, time }) => {
    const isCenter = sender === 'center';
    const isRight = sender === 'right';

    return (
        <View style={[styles.messageContainer, isCenter ? styles.center : (isRight ? styles.right : styles.left)]}>
            <View style={[styles.bubble, isCenter ? styles.bubbleCenter : (isRight ? styles.bubbleRight : styles.bubbleLeft)]}>
                {!isCenter && !isRight && <Text style={[styles.senderName, styles[sender]]}>{sender}</Text>}
                <Text style={styles.messageText}>{message}</Text>
                {!isCenter && <Text style={styles.time}>{time}</Text>}
            </View>
        </View>
    );
};

const randomColor = () => {
    const colors = ['#ff5733', '#33a0ff', '#33ff41', '#d433ff', '#ffb533', '#33fff3', '#eb33ff', '#3380ff'];
    return colors[Math.floor(Math.random() * colors.length)];
};

const ChatScreen = ({ route }) => {
    const { username } = route.params;
    
    const scrollViewRef = useRef();
    const [currentDate, setCurrentDate] = useState('')
    const [inputValue, setInputValue] = useState('')
    const [messages, setMessages] = useState([
        { message: 'Sample received message', sender: 'Alice', time: '11:30 AM', userId: '1', peerId: '0' },
        { message: 'Sample sent message', sender: 'Bob', time: '11:35 AM', userId: '1', peerId: '0' },
        { message: 'Sample center message', sender: 'center', time: '11:35 AM', userId: '1', peerId: '0' },
        { message: 'Sample sent message', sender: 'right', time: '11:35 AM', userId: '1', peerId: '0' },
        { message: 'Another sample received message', sender: 'Alice', time: '11:40 AM', userId: '1', peerId: '0' },
        { message: 'Another sample sent message', sender: 'Bob', time: '11:45 AM', userId: '1', peerId: '0' },
    ])

    const sendMessage = () => {
        socket.emit('send', { message: inputValue, roomId: 'general', peerId: 'your_peer_id' });
        const datetime = new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
        setMessages([...messages, { message: inputValue, sender: 'right', time: datetime }])
        setInputValue('')
    };

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to the server');
        });

        socket.emit('new-user-joined', {name: username, userId: socket.id, roomId: 'general', peerId: 'your_peer_id'});
        socket.emit('join-room', {roomId: 'general', userId: socket.id});
        
        // If a new user joins, receive his/her name from the server
        socket.on('user-joined', ({name, userId, peerId}) => {
            console.log("User joined ", userId)
            setMessages([...messages, { message: name + ' joined the chat with peerId ' + peerId, sender: 'center' }])
        })

        // If someone sends a message, broadcast it to other people
        socket.on('receive', ({ message, name, userId, peerId }) => {
            console.log(`${userId} received a message: ${message} from ${name} (${peerId})`);
            const datetime = new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', hour12: true});
            setMessages([...messages, { message, sender: name, time: datetime, userId, peerId }])
        });

        // If someone leaves the chat, let others know 
        socket.on('left', (leftUser) => {
            console.log(`${leftUser} has left the chat`);
            setMessages([...messages, { message: leftUser + ' left the chat', sender: 'center' }])
        });

        // Get the list of connected users in a room
        socket.on('get-users',);
        socket.emit('users-in-room', users=>{
            console.log(users)
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const uniqueSenders = [...new Set(messages.map((msg) => msg.sender))];
    const senderColors = {};

    uniqueSenders.forEach((sender) => {
        senderColors[sender] = randomColor();
    });

    useEffect(() => {
        scrollViewRef.current.scrollToEnd({ animated: false });
    }, [messages]);

    useState(() => {
        setCurrentDate(messages.length > 0 ? messages[0].time : '');
    }, [messages]);

    const [showDate, setShowDate] = useState(false);

    const handleScroll = (event) => {
        const { layoutMeasurement, contentSize, contentOffset } = event.nativeEvent;
        const bottomOffset = contentSize.height - contentOffset.y - layoutMeasurement.height;
        setShowDate(bottomOffset >= 30);
    };

    return (
        <View style={styles.container}>
            {showDate && (
                <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{currentDate}</Text>
                </View>
            )}
            <ScrollView style={styles.chatContainer} ref={scrollViewRef} scrollEventThrottle={16} onScroll={handleScroll}>
                {messages.map((msg, index) => (
                    <Message key={index} message={msg.message} sender={msg.sender} time={msg.time} />
                ))}
            </ScrollView>
            <View style={styles.inputContainer}>
                <TextInput style={styles.input} placeholder="Message" value={inputValue} onChangeText={text => setInputValue(text)} />
                <TouchableHighlight style={styles.sendButton} underlayColor="#3b8b2d" onPress={sendMessage}>
                    <Text style={styles.buttonText}><MaterialCommunityIcons name="send" size={24} color="white" /></Text>
                </TouchableHighlight>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ECE5DD',
        padding: 0,
        justifyContent: 'space-between',
    },
    chatContainer: {
        flex: 1,
        overflow: 'scroll',
        paddingTop: 3,
        paddingBottom: 0,
    },
    messageContainer: {
        alignItems: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 0,
    },
    bubble: {
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 10,
        marginBottom: 5,
        maxWidth: '80%',
    },
    bubbleRight: {
        backgroundColor: '#DCF8C6',
        borderTopRightRadius: 0,
    },
    bubbleLeft: {
        backgroundColor: 'white',
        borderTopLeftRadius: 0,
    },
    bubbleCenter: {
        backgroundColor: '#daedf7',
        alignSelf: 'center',
        marginTop: 5,
        marginBottom: 10,
    },
    messageText: {
        fontSize: 16,
    },
    left: {
        alignItems: 'flex-start',
    },
    right: {
        alignItems: 'flex-end',
    },
    senderName: {
        fontWeight: 'bold',
        color: 'blue'
    },
    time: {
        fontSize: 12,
        color: 'gray',
        marginTop: 3,
        alignSelf: 'flex-end'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 3,
        marginBottom: 6,
        paddingHorizontal: 5
    },
    input: {
        flex: 1,
        borderRadius: 50,
        paddingVertical: 7,
        paddingHorizontal: 20,
        marginRight: 3,
        backgroundColor: 'white',
        fontSize: 18,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 1,
    },
    sendButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 50,
        padding: 10,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
    dateContainer: {
        backgroundColor: '#ebebeb',
        paddingVertical: 5,
        paddingHorizontal: 10,
        alignItems: 'center',
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 10,
        borderRadius: 10,
        top: 2
    },
    dateText: {
        color: 'black',
    },
});

export default ChatScreen;
