import react, { useState } from "react";
import { View, StyleSheet, Text, TextInput, Pressable } from "react-native";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/connection";

const Separator = () => {
    return <View style={styles.separator} />
}

export default function Products() {
    const [name, setName] = useState("");
    const [dev, setDev] = useState("");
    const [desc, setDesc] = useState("");
    const [ano, setAno] = useState(Number);
    let [cadastrar, setCad] = useState(false)
    async function addProduct() {
        if (name == "" || dev == "" || desc == "" || (ano == "" || isNaN(ano))) {
            
            return console.log("erro");
            
        }
        try {
            const docRef = await addDoc(collection(db, "Produtos"), {
                nome: name,
                produtora: dev,
                descricao: desc,
                ano: ano
            });
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }
    return (
            cadastrar ? (
                <View style={styles.container}>
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Título</Text>
                    <TextInput style={styles.Input} onChangeText={(text) => setName(text)} placeholder="Digite aqui" />
                    <Separator />
                    <Text style={styles.formTitle}>Desenvolvedora</Text>
                    <TextInput style={styles.Input} onChangeText={(text) => setDev(text)} placeholder="Digite aqui" />
                    <Separator />
                    <Text style={styles.formTitle}>Categoria</Text>
                    <TextInput style={styles.Input} onChangeText={(text) => setDesc(text)} placeholder="Digite aqui" />
                    <Separator />
                    <Text style={styles.formTitle}>Ano de lançamento</Text>
                    <TextInput style={styles.Input} onChangeText={(text) => setAno(text)} placeholder="Digite aqui" />
                    <Separator />
                    
                </View>
                <Pressable onPress={addProduct}><Text style={styles.btnSave}>Salvar</Text></Pressable>
                </View>
                ) : (<View style={styles.container}>
                    <Pressable onPress={() => {setCad(true)}}>
                        <Text style={styles.btnSave}>Cadastrar</Text>
                        </Pressable>
                    </View>)
            
        
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center"
    },

    form: {
        marginVertical: 15
    },

    formTitle:{
        marginVertical: 5,
        paddingHorizontal: 30
    },

    Input: {
        backgroundColor: "#fff",
        paddingVertical: 0,
        paddingHorizontal: 30,
        height: "6vh",
        width: "85vw",
        //borderWidth: 2,
        borderRadius: 100
    },

    btnSave:{
        textAlign:"center",
        //textAlignVertical: "bottom",
        fontSize: 20,
        color: "white",
        width: "50vw",
        height: "4vh",
        borderRadius: 100,
        backgroundColor: "#88d"
    },

    separator: {
        marginVertical: 5,
    },
})