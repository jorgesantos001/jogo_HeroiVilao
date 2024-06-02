new Vue({
    el: '#app',
    data: {
        heroiVida: '',
        vilaoVida: '',
        acoesHeroi: [],
        acoesVilao: []
    },
    mounted() {
        this.fetchCharacterData();
        setInterval(this.fetchCharacterData, 2000);
    },
    methods: {
        async fetchCharacterData() {
            try {
                const response = await fetch('http://localhost:3000/characters');
                const data = await response.json();
                this.heroiVida = data.heroi.Vida;
                this.vilaoVida = data.vilao.Vida;
                this.fetchActions();
            } catch (error) {
                console.error('Erro ao buscar dados dos personagens:', error);
            }
        },
        async fetchActions() {
            try {
                const responseHeroi = await fetch('http://localhost:3000/actions/heroi');
                const responseVilao = await fetch('http://localhost:3000/actions/vilao');
                const dataHeroi = await responseHeroi.json();
                const dataVilao = await responseVilao.json();
                this.acoesHeroi = dataHeroi.acoes;
                this.acoesVilao = dataVilao.acoes;
            } catch (error) {
                console.error('Erro ao buscar ações dos personagens:', error);
            }
        }
    }
});
