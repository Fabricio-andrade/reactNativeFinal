import react, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Text, TextInput, Pressable, FlatList, Button, Image, PermissionsAndroid, ScrollView, StatusBar } from "react-native";
//import { launchImageLibrary } from "react-native-image-picker";
import { collection, addDoc, getDocs, updateDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/connection";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';

const Separator = () => {
    return <View style={styles.separator} />
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false
    }),
});

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
    //Notification
    const [expoPushToken, setExpoPushToken] = useState('');
    const [channels, setChannels] = useState([]);
    const [notification, setNotification] = useState(undefined);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));

        if (Device.OS === 'android') {
            Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
        }
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });

        return () => {
            notificationListener.current &&
                Notifications.removeNotificationSubscription(notificationListener.current);
            responseListener.current &&
                Notifications.removeNotificationSubscription(responseListener.current);
        };
    }, []);

    //Produtos
    const [name, setName] = useState("");
    const [dev, setDev] = useState("");
    const [categoria, setCategoria] = useState("");
    const [ano, setAno] = useState(Number);
    const [products, setProducts] = useState([]);
    const [desc, setDesc] = useState("");
    const [key, setKey] = useState("");
    let [cadastrar, setCad] = useState(false);
    let [edit, setEdit] = useState(false);


    //Image
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [16, 9],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    useEffect(() => {
        Listar();
    }, [])

    async function Listar() {
        setProducts([])
        const querySnapshot = await getDocs(collection(db, "Produtos"));
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            const produtos = {
                id: doc.id,
                nome: doc.data().nome,
                prod: doc.data().produtora,
                categoria: doc.data().categoria,
                ano: doc.data().ano,
                image: doc.data().Image,
                desc: doc.data().desc

            }
            setProducts(e => [...e, produtos].reverse());
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
                ano: ano,
                Image: image,
                desc: desc
            });
            setProducts(e => [{
                nome: name,
                prod: dev,
                categoria: categoria,
                ano: ano,
                Image: image,
                desc: desc
            }, ...e]);
            setCad(false);
            await schedulePushNotificationCad(name);
            console.log("Document written with ID: ", docRef.id);
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    function handleEdit(e) {
        setEdit(true);
        setCad(true);
        setKey(e.id);
        setName(e.nome);
        setDev(e.prod);
        setCategoria(e.categoria);
        setAno(e.ano);
        setImage(e.image);
        setDesc(e.desc);
    }

    async function editProduct() {
        const docRef = doc(db, "Produtos", key);
        await setDoc(docRef, {
            nome: name,
            produtora: dev,
            categoria: categoria,
            ano: ano,
            Image: image,
            desc: desc
        });
        setEdit(false);
        setCad(false);
        await schedulePushNotificationEdit(name)
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
        setDesc("");
        setProducts("");
    }

    function Cad() {
        setKey("");
        setName("");
        setDev("");
        setCategoria("");
        setAno("");
        setDesc("");
        setImage(null);
        setCad(true);
    }
    return (
        cadastrar ? (
            <ScrollView contentContainerStyle={[styles.container]}>
                <Pressable onPress={() => { setCad(false) }}>
                    <Text style={styles.exit}>X</Text>
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
                    <Text style={styles.formTitle}>Sinopse</Text>
                    <TextInput style={styles.Input} onChangeText={(text) => setDesc(text)} placeholder="Digite aqui" value={desc} />
                    <Separator />
                    <View style={picker.container}>
                        <Pressable onPress={pickImage}>
                            <Text style={picker.btnImage}>Escolher Imagem</Text>
                        </Pressable>
                        {image && <Image source={{ uri: image }} style={picker.image} />}
                    </View>
                    <View style={{flex:1, height: 20}}>
                    {edit ?
                        <Pressable style={styles.Pressable} onPress={editProduct}><Text style={styles.btnSave}>Alterar</Text></Pressable> :
                        <Pressable style={styles.Pressable} onPress={addProduct}><Text style={styles.btnSave}>Salvar</Text></Pressable>
                    }
                    </View>
                </View>
            </ScrollView>
        ) : (<View style={styles.container}>
            <View style={styles.content}>
                <Pressable onPress={Cad}>
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

async function schedulePushNotificationCad(name) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Novo jogo adicionado",
            body: name,
            data: { data: 'goes here', test: { test1: 'more data' } },
        },
        trigger: { seconds: 1 },
    });
}

async function schedulePushNotificationEdit(name) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Jogo alterado",
            body: name,
            data: { data: 'goes here', test: { test1: 'more data' } },
        },
        trigger: { seconds: 1 },
    });
}

async function registerForPushNotificationsAsync() {
    let token;

    if (Device.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        // EAS projectId is used here.
        try {
            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
            if (!projectId) {
                throw new Error('Project ID not found');
            }
            token = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log(token);
        } catch (e) {
            token = `${e}`;
        }
    } else {
        alert('Must use physical device for Push Notifications');
    }

    return token;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: "#222",
        width: "100%",
        height: "100%",
        
    },

    content: {
        margin: 5,
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

    cardText: {
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

    },
    Pressable: {
        flex: 1,
        //       alignItems: "center",
        //       justifyContent: "center",
        height: 30
    },

    btnSave: {
        textAlign: "center",
        textAlignVertical: "bottom",
        marginTop: 50,
        paddingVertical: 10,
        fontSize: 20,
        color: "white",
        width: "95vw",
        height: "6vh",
        backgroundColor: "#5b5"
    },

    exit: {
        backgroundColor: "#5b5",
        color: "#fff",
        width: 30,
        height: 30,
        textAlign: "center",
        textAlignVertical: "center",
        fontSize: 20,
        marginTop: 15

    },

    separator: {
        marginVertical: 5,
    },
})

const picker = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        //justifyContent: 'center',
        minHeight: 100,
        maxHeight: 200
    },
    image: {
        minWidth: '96%',
        height: '100%'
    },
    btnImage: {
        color: '#fff',
        width: 335,
        textAlign: "center",
        textAlignVertical: 'center',
        marginVertical: 15,
        backgroundColor: '#5b5',
        height: 40,
        fontSize: 20
    },
});