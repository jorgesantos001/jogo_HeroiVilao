const { createApp } = Vue;
const API_URL = 'http://localhost:3000';

createApp({
    data() {
        return {
            heroi: { vida: 100 },
            vilao: { vida: 100 },
            mensagemDerrota: '',
            mensagemDefesaHeroi: '',
            mensagemDefesaVilao: '',
            mensagemCorreu: '',
        }
    },
    methods: {
        async atacar(isHeroi) {
            this.mensagemDefesaHeroi = '';
            this.mensagemDefesaVilao = '';
            if (isHeroi) {
                console.log("Herói atacou");
                this.vilao.vida = Math.max(0, this.vilao.vida - 10);
                if (this.vilao.vida === 0) {
                    console.log("Vilão derrotado!");
                    this.mensagemDerrota = 'Vilão derrotado!';
                } else {
                    // Vilão ataca automaticamente se ainda estiver vivo
                    this.acaoVilao();
                }
            } else {
                console.log("Vilão atacou");
                this.heroi.vida = Math.max(0, this.heroi.vida - 10);
                console.log(`Nova vida do herói: ${this.heroi.vida}`);
                if (this.heroi.vida === 0) {
                    console.log("Herói derrotado!");
                    this.mensagemDerrota = 'Herói derrotado!';
                }
            }

            await this.atualizarVidaNoBancoDeDados();
            this.registrarAcao(isHeroi, 'atacar');
        },
        async defender(isHeroi) {
            if (isHeroi) {
                console.log("Herói defendeu");
                this.mensagemDefesaHeroi = 'Herói defendeu';
            } else {
                console.log("Vilão defendeu");
                this.mensagemDefesaVilao = 'Vilão defendeu';
            }
            this.registrarAcao(isHeroi, 'defender');
            setTimeout(() => {
                this.mensagemDefesaHeroi = '';
                this.mensagemDefesaVilao = '';
            }, 2000);
        },
        async usarPocao(isHeroi) {
            if (isHeroi) {
                console.log("Herói usou uma poção");
                this.heroi.vida = Math.min(100, this.heroi.vida + 10);
            } else {
                console.log("Vilão usou uma poção");
                this.vilao.vida = Math.min(100, this.vilao.vida + 10);
            }
            await this.atualizarVidaNoBancoDeDados();
            this.registrarAcao(isHeroi, 'usarPocao');
        },
        correr(isHeroi) {
            if (isHeroi) {
                console.log("Herói tentou correr");
                this.mensagemCorreu = 'Herói correu'; 
                setTimeout(() => {
                    this.mensagemCorreu = '';
                }, 2000);
            } else {
                console.log("Vilão tentou correr");
            }
            this.registrarAcao(isHeroi, 'correr');
        },
        async atualizarVidaNoBancoDeDados() {
            console.log(`Atualizando vida no banco de dados: vidaHeroi = ${this.heroi.vida}, vidaVilao = ${this.vilao.vida}`);
            try {
                const response = await fetch(`${API_URL}/atualizarVida`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ vidaHeroi: this.heroi.vida, vidaVilao: this.vilao.vida })
                });
                if (!response.ok) {
                    throw new Error('Erro ao atualizar vida no banco de dados.');
                }
                console.log('Vidas atualizadas com sucesso.');
            } catch (error) {
                console.error('Erro ao atualizar vida no banco de dados:', error);
            }
        },
        
        async registrarAcao(isHeroi, acao) {
            try {
                const response = await fetch(`${API_URL}/registrarAcao`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ personagem: isHeroi ? 'heroi' : 'vilao', acao })
                });
                if (!response.ok) {
                    throw new Error('Erro ao registrar ação no banco de dados.');
                }
                console.log('Ação registrada com sucesso.');
            } catch (error) {
                console.error('Erro ao registrar ação no banco de dados:', error);
            }
        },
        acaoVilao() {
            const acoes = ['atacar', 'defender', 'usarPocao', 'correr'];
            let probabilidades = [0.4, 0.1, 0.3, 0.2]; 
            if (this.vilao.vida < 30) {
                probabilidades[2] = 0.5;
            }
            let totalProbabilidade = 0;
            for (let i = 0; i < acoes.length; i++) {
                totalProbabilidade += probabilidades[i];
            }
            let random = Math.random() * totalProbabilidade;
            let acaoSelecionada;
            for (let i = 0; i < acoes.length; i++) {
                if (random < probabilidades[i]) {
                    acaoSelecionada = acoes[i];
                    break;
                }
                random -= probabilidades[i];
            }
            this[acaoSelecionada](false);
        }        
    }
}).mount("#app")
