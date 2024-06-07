import react, { useEffect, useState } from "react";
import { View, StyleSheet, Text, TextInput, Pressable, FlatList } from "react-native";
import { collection, addDoc, getDocs, updateDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/connection";

const Separator = () => {
    return <View style={styles.separator} />
}

function ProductsList({ data, deleteItem, editItem }) {
    return (
        <View style={styles.Card}>
            <View style={styles.cardContent}>
                <Text style={[styles.text, styles.cardText]}>{data.nome}</Text>
                <Text style={[styles.text, styles.cardText]}>Desenvolvido por {data.prod}</Text>
                <Text style={[styles.text, styles.cardText]}>Categoria: {data.categoria}</Text>
                <Text style={[styles.text, styles.cardText]}>Ano de lançamento: {data.ano}</Text>
            </View>
            <View style={styles.cardOptions}>
                <Pressable onPress={() => deleteItem(data.key)}>
                    <Text style={[styles.optionsText, styles.optionsDel]}>Excluir</Text>
                </Pressable>
                <Pressable onPress={() => editItem(data)}>
                    <Text style={[styles.optionsText, styles.optionsEdit]} >Editar</Text>
                </Pressable>
            </View>
        </View>
    )
}

export default function Products() {
    const [name, setName] = useState("");
    const [dev, setDev] = useState("");
    const [categoria, setCategoria] = useState("");
    const [ano, setAno] = useState(Number);
    const [products, setProducts] = useState([]);
    const [key, setKey] = useState("")
    let [cadastrar, setCad] = useState(false);
    let [edit, setEdit] = useState(false);

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
                ano: doc.data().ano
            }
            setProducts(e => [...e, produtos].reverse());
            console.log(doc.id, " => ", doc.data());
        });
    }

    async function addProduct() {
        if (name == "" || dev == "" || categoria == "" || (ano == "" || isNaN(ano))) {

            return console.log("erro");

        }
        try {
            const docRef = await addDoc(collection(db, "Produtos"), {
                nome: name,
                produtora: dev,
                categoria: categoria,
                ano: ano
            });
            setProducts(e => [{
                nome: name,
                prod: dev,
                categoria: categoria,
                ano: ano
            }, ...e]);
            setCad(false);
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    function handleEdit(e) {
        setEdit(true);
        setCad(true);
        setKey(e.id),
            setName(e.nome),
            setDev(e.prod),
            setCategoria(e.categoria),
            setAno(e.ano)
    }

    async function editProduct() {
        const docRef = doc(db, "Produtos", key);
        await setDoc(docRef, {
            nome: name,
            produtora: dev,
            categoria: categoria,
            ano: ano
        });
        setEdit(false);
        setCad(false);
        clearData();
        await Listar();
    }

    async function handleDelete(e) {
        await deleteDoc(doc(db, "Produtos", e));
        clearData();
        await Listar();
    }

    function clearData() {
        setKey("");
        setName("");
        setDev("");
        setCategoria("");
        setAno("");
        setProducts("");
    }
    return (
    cadastrar ? (
        <View style={styles.container}>
            <View style={styles.content}>
                <Pressable onPress={() => { setCad(false) }}>
                    <Text style={styles.text}>X</Text>
                </Pressable>
                <View style={styles.form}>
                    <Text style={styles.formTitle}>Título</Text>
                    <TextInput style={styles.Input} onChangeText={(text) => setName(text)} placeholder="Digite aqui" value={name} />
                    <Separator />
                    <Text style={styles.formTitle}>Desenvolvedora</Text>
                    <TextInput style={styles.Input} onChangeText={(text) => setDev(text)} placeholder="Digite aqui" value={dev} />
                    <Separator />
                    <Text style={styles.formTitle}>Categoria</Text>
                    <TextInput style={styles.Input} onChangeText={(text) => setCategoria(text)} placeholder="Digite aqui" value={categoria} />
                    <Separator />
                    <Text style={styles.formTitle}>Ano de lançamento</Text>
                    <TextInput style={styles.Input} onChangeText={(text) => setAno(text)} placeholder="Digite aqui" value={ano} />
                    <Separator />

                </View>
                {edit ?
                    <Pressable style={styles.Pressable} onPress={editProduct}><Text style={styles.btnSave}>Alterar</Text></Pressable> :
                    <Pressable style={styles.Pressable} onPress={addProduct}><Text style={styles.btnSave}>Salvar</Text></Pressable>
                }
            </View>
        </View>
    ) : (<View style={styles.container}>
        <View style={styles.content}>
            <Pressable onPress={() => { setCad(true) }}>
                <Text style={styles.btnSave}>Cadastrar</Text>
            </Pressable>
            <FlatList keyExtractor={item => item.key} data={products} renderItem={({ item }) => (
                <ProductsList data={item} editItem={handleEdit} deleteItem={() => handleDelete(item.id)} />
            )} />
        </View>
    </View>
    )
);
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#222",
        width: "100vw",
        height: "100vh"
    },

    content: {
        margin: 15,
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
    cardContent:{
        minWidth: '50%',
        maxWidth: '50%'
    },  

    text: {
        color: "white"
    },

    optionsText: {
        color: "white",
        marginVertical: "10px",
        marginRight: 15,
        fontSize: 16,
        width: 100,
        height: 30,
        textAlign: 'center',
        paddingTop: 3
    },

    cardText:{
        borderBottomColor: "#fff",
        borderBottomWidth: StyleSheet.hairlineWidth,
        marginVertical: 5,
        
    },

    optionsEdit: {
        backgroundColor: '#44f'
    },
    optionsDel: {
        backgroundColor: '#f44'
    },

    form: {
        marginVertical: 15
    },

    formTitle: {
        marginVertical: 5,
        paddingHorizontal: 30,
        color: '#fff'
    },

    Input: {
        backgroundColor: "#fff",
        paddingVertical: 0,
        paddingHorizontal: 30,
        height: "6vh",
        width: "95vw",
        //borderWidth: 2,
        //borderRadius: 100
    },
    Pressable: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },

    btnSave: {
        textAlign: "center",
        textAlignVertical: "bottom",
        paddingVertical: 10,
        fontSize: 20,
        color: "white",
        width: "95vw",
        height: "6vh",
        //borderRadius: 100,
        backgroundColor: "#5b5"
    },

    separator: {
        marginVertical: 5,
    },
})