import react, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, Text, TextInput, Pressable, FlatList, Button, Image } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { collection, addDoc, getDocs, updateDoc, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/connection";
import { getStorage, ref } from "firebase/storage";
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

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
    const [SelectedImage, setImage] = useState(null);
    const [desc, setDesc] = useState("");
    const [key, setKey] = useState("");
    let [cadastrar, setCad] = useState(false);
    let [edit, setEdit] = useState(false);


    //Image
    const openImagePicker = async () => {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
            minWidth: 500
        };

        await launchImageLibrary(options, handleResponse);
        console.log(SelectedImage);
    };

    const handleResponse = (response) => {
        if (response.didCancel) {
            console.log('User cancelled image picker');
        } else if (response.error) {
            console.log('Image picker error: ', response.error);
        } else {
            let imageUri = response.uri || response.assets?.[0]?.uri;
            setImage(imageUri);
        }
    };
    const storage = getStorage()

    const imageRef = ref(storage, `assets/${SelectedImage}`)

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
                ano: ano,
                Image: SelectedImage,
                desc: desc
            });
            setProducts(e => [{
                nome: name,
                prod: dev,
                categoria: categoria,
                ano: ano,
                Image: SelectedImage,
                desc: desc
            }, ...e]);
            setCad(false);
            await schedulePushNotification(name);
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
        setImage(e.SelectedImage);
        setDesc(e.Desc);
    }

    async function editProduct() {
        const docRef = doc(db, "Produtos", key);
        await setDoc(docRef, {
            nome: name,
            produtora: dev,
            categoria: categoria,
            ano: ano,
            Image: SelectedImage,
            desc: desc
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
                        <Text style={styles.formTitle}>Sinopse</Text>
                        <TextInput style={styles.Input} onChangeText={(text) => setDesc(text)} placeholder="Digite aqui" value={desc} />
                        <Separator />
                        <Button title='Escolher imagem' onPress={openImagePicker} />
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            {SelectedImage ?
                                <Image source={{ uri: SelectedImage }} style={{ flex: 1, maxWidth:'95vw', minHeight: "30vh" }} resizeMode="contain" /> : ''
                            }
                        </View>

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

async function schedulePushNotification(name) {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Novo jogo adicionado",
            body: name,
            data: { data: 'goes here', test: { test1: 'more data' } },
        },
        trigger: { seconds: 2 },
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
        height: "100%"
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