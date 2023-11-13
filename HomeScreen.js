// HomeScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
    const [username, setUsername] = useState('Sai');

    const handleUsernameSubmit = () => {
        if (username.trim() !== '') {
            navigation.navigate('Chat', { username });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enter Your Username</Text>
            <TextInput
                style={styles.input}
                value={username}
                onChangeText={(text) => setUsername(text)}
                placeholder="Username"
            />
            <Button style={styles.btn} title="Submit" onPress={handleUsernameSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#f2f2f2',
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 20,
    },
    btn: {
        paddingHorizontal: 20,
        paddingVertical: 20
    }
});

export default HomeScreen;
