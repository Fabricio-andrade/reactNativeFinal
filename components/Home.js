import react, { useState, useEffect } from "react";
import { Text, View, SafeAreaView, StyleSheet, Button, FlatList, Image } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/connection";

function ProductsList({ data }) {
    return (
        <View style={styles.Card}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{data.nome}</Text>
                <Image require={{uri: data.Image}} style={{ flex: 1, maxWidth:'95vw', minHeight: "30vh" }} resizeMode="contain"/>
                <Text style={styles.cardInfo}>Desenvolvido por {data.prod}</Text>
                <Text style={styles.cardInfo}>Ano de lançamento: {data.ano}</Text>
                <Text style={styles.cardInfo}>Categoria(s): {data.categoria}</Text>
            </View>
        </View>
    )
}

export default function Home() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        Listar();
    }, [])

    async function Listar() {
        const querySnapshot = await getDocs(collection(db, "Produtos"));
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            const produtos = {
                id: doc.id,
                nome: doc.data().nome,
                prod: doc.data().produtora,
                categoria: doc.data().categoria,
                ano: doc.data().ano,
                desc: doc.data().desc,
                image: doc.data().Image
            }
            setProducts(e => [...e, produtos].reverse());
            console.log(doc.id, " => ", doc.data());
        });
    }
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Todos os seus jogos<br /> em um só lugar!</Text>
            <FlatList keyExtractor={item => item.key} data={products} renderItem={({ item }) => (
                <ProductsList data={item} />
            )} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 30,
        color: '#fff'
    },
    Card: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        padding: 10,
        backgroundColor: "#444",
        width: "95vw",
        height: "15vh"
    },
    cardContent: {
        maxWidth: '100%',
        minHeight: '20vh'
    },

    cardText: {
        flex: 1,
        flexDirection: 'row',
        color: '#fff',
        

    },
    cardTitle: {
        fontSize: 28,
        color: '#fff'
    },
    cardInfo: {
        fontSize: 15,
        marginVertical: 8,
        color: '#fff'
    }


})