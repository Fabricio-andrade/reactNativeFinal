import React from "react";
import { View, ImageBackground, Text, StyleSheet, Pressable } from "react-native";

export default function Start() {
    return (
        <View style={styles.container}>
            <Pressable style={styles.button}>
                <Text>Login</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#222",
        alignItems: "center",
        justifyContent: "center"
    },
    button:{
        backgroundColor: "white",
        width: 150
    }
    
})