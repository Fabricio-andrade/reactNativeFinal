import react, { useState, useEffect, useCallback } from "react";
import { Text, View, SafeAreaView, StyleSheet, Button, FlatList, Image, Pressable, ScrollView, RefreshControl } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { Firestore } from "firebase/firestore";
import { getStorage, ref } from "firebase/storage";
import { db } from "../firebase/connection";

function ProductsList({ data }) {
    const [show, setShow] = useState(false);
    let image = data.image;
    return (
        <View style={styles.Card}>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{data.nome}</Text>
                <View style={styles.cardImage} >
                    <Image source={{ uri: image }} style={styles.cardImage} resizeMode="contain" />
                </View>
                {show ?
                    <>
                        <Text style={styles.cardInfo}>Desenvolvido por {data.prod}</Text>
                        <Text style={styles.cardInfo}>Ano de lançamento: {data.ano}</Text>
                        <Text style={styles.cardInfo}>Categoria(s): {data.categoria}</Text>
                        <Text style={styles.cardInfo}>Sinopse:</Text>
                        <Text style={styles.cardInfo}>{data.desc}</Text>
                    </>
                    : ''
                }
                {!show ?
                    <Pressable onPress={() => { setShow(true) }}><Text style={{ color: '#fff' }}>Mostrar mais</Text></Pressable> :
                    <Pressable onPress={() => { setShow(false) }}><Text style={{ color: '#fff' }}>Recolher</Text></Pressable>
                }
            </View>
        </View>
    )
}

export default function Home() {
    const [products, setProducts] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(async () => {
            setRefreshing(false);
            await Listar();
        }, 2000);
        console.log("Refreshed");
    }, []);


    useEffect(() => {
        Listar();
    }, [])

    async function Listar() {
        setProducts([])
        const querySnapshot = await getDocs(collection(db, "Produtos"));
        querySnapshot.forEach(async (doc) => {
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
        });
    }
    return (
        <View style={styles.container}>

            <Text style={styles.title}>Todos os seus jogos em um só lugar!</Text>

            <FlatList keyExtractor={item => item.key} data={products} renderItem={({ item }) => (
                <ProductsList data={item} />
            )} refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            } />

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
    title: {
        color: "#fff",
        fontSize: 28,
        marginVertical: 20
    },
    text: {
        fontSize: 30,
        color: '#fff',

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
    },
    cardImage: {
        flex: 1,
        flexDirection: "row",
        minWidth: "100%",
        minHeight: 200,
        marginVertical: 8
    },
    scrollView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },



})