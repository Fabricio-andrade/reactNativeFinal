import { useState } from 'react';
import { Pressable, Text, Image, View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function Picker() {
    const [image, setImage] = useState(null);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <Pressable onPress={pickImage}>
                <Text style={styles.btnImage}>Escolher Imagem</Text>
            </Pressable>
            {image && <Image source={{ uri: image }} style={styles.image} />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        //justifyContent: 'center',
    },
    image: {
        width: '100%',
        height: 200,
    },
    btnImage:{
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
