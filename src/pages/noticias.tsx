import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, ScrollView, StyleSheet } from 'react-native';
import { QueryClient, QueryClientProvider, useQuery } from 'react-query';
import Swal from 'sweetalert2';

const queryClient = new QueryClient();

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fbf8',
        padding: 10
    },
    title: {
        fontSize: 24,
        color: '#29017e',
        marginBottom: 10
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#7e7d7d',
        borderRadius: 6,
        paddingHorizontal: 10,
        marginBottom: 10
    },
    card: {
        width: '70%',
        height: '8%',
        marginLeft: 'auto',
        marginRight: 'auto',
        marginTop: '5%',
        paddingHorizontal:'4%',
        paddingVertical: '5%',
        shadowColor: '#17013d',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 3
        },
        elevation: 3,
        borderRadius: 9
    },
    cardImage: {
        height: '45%',
        resizeMode: 'cover',
        borderRadius: 6
    },
    cardTitle: {
        fontSize: 19,
        color: '#02027a',
        marginTop: '3%',
        marginBottom: '3%'
    },
    cardDate: {
        backgroundColor: '#707070',
        color: '#f8fbf8',
        padding: 2,
        borderRadius: 10,
        fontSize: 13,
        marginLeft: '1%'
    },
    cardText: {
        marginTop: '3%',
        fontSize: 15,
        color: '#6d6d6d'
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    paginationButton: {
        marginHorizontal: 5
    },
    pageNumber: {
        marginTop: '2%'
    }
});

function Noticias() {
    const [busca, setBusca] = useState('');
    const [currentPage, setcurrentPage] = useState(1);

    const { isLoading, isError, data } = useQuery('noticias', async () => {
        const response = await fetch('http://servicodados.ibge.gov.br/api/v3/noticias/');
        if (!response.ok) {
            Swal.fire({
                icon: "error",
                title: "Ocorreu um erro ao tentar excluir",
                showConfirmButton: false,
                timer: 3000
            });
        } 
        console.log(response)
        return response.json();
    });

    if (isLoading) {
        return <Text>Carregando...</Text>;
    }

    if (isError) {
        return <Text>Ocorreu um erro ao buscar as notícias</Text>;
    }

    const jsonNoticias = data.items;

    const itemsPerPage = 30;
    let indexOfLastItem = currentPage * itemsPerPage;
    let indexOfFirstItem = indexOfLastItem - itemsPerPage;
    let currentItems = jsonNoticias.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(jsonNoticias.length / itemsPerPage);

    const changePage = (newPage:any) => {
        setcurrentPage(newPage);
    };

    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={styles.title}>IBGE News</Text>
                <TextInput
                    style={styles.searchInput}
                    onChangeText={(text) => setBusca(text)}
                    value={busca}
                    placeholder="Buscar"
                />
            </View>
            <ScrollView>
                {jsonNoticias
                    .filter((item:any) => {
                        const searchWords = busca.toLowerCase().split(' ');
                        return searchWords.every((word) =>  
                            item.titulo.toLowerCase().includes(word)
                        );
                    })
                    .slice(indexOfFirstItem, indexOfLastItem)
                    .map((noticia:any) => {
                        const imageUrl = `https://agenciadenoticias.ibge.gov.br/${JSON.parse(
                            noticia.imagens
                        ).image_intro?.replace(/\\/g, '')}`;

                        return (
                            <View key={noticia.id} style={styles.card}>
                                <Image
                                    style={styles.cardImage}
                                    source={{ uri: imageUrl }}
                                />
                                <Text style={styles.cardTitle}>{noticia.titulo} <Text style={styles.cardDate}>{noticia.data_publicacao.split(' ')[0]}</Text></Text>
                            </View>
                        );
                    })}
            </ScrollView>
            <View style={styles.pagination}>
                <View style={styles.paginationButton}>
                    <Button title="Anterior" onPress={() => changePage(currentPage - 1)} disabled={currentPage === 1} />
                </View>

                <View style={styles.pageNumber}><Text style={{ marginHorizontal: 10 }}>Página {currentPage} / {totalPages}</Text></View>

                <View style={styles.paginationButton}>
                    <Button title="Próxima" onPress={() => changePage(currentPage + 1)} disabled={currentPage === totalPages} />
                </View>

            </View>
        </View>
    );
}

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Noticias />
        </QueryClientProvider>
    );
}
