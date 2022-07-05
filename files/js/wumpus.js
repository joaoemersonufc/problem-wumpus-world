class Wumpus {

    constructor() {
        this.worldData = new Array(4);
        this.worldVisited = new Array(4);

        this.steps = [];

        this.Moves = {
            Right: 1,
            Left: 2,
            Up: 3,
            Down: 4
        };

        this.shootDirection = this.Moves.Right;
        this.totalMoves = 0;
        this.randomMoves = 0;
        this.goldFound = false;
        this.point = 0;
        this.gameOver = false;
    }

    reStart() {
        // Iniciando o mundo
        for (var x = 1; x <= 4; x++) {
            this.worldData[x] = new Array(4);
            this.worldVisited[x] = new Array(4);

            for (var y = 1; y <= 4; y++) {
                this.worldData[x][y] = new Cell(x, y);
                this.worldVisited[x][y] = new CellVisited(x, y);
            }
        }

        // Colocando os buracos
        var countPit = 0;
        while (countPit < 2) {
            x = this.rand(1, 4);
            y = this.rand(1, 4);

            if ((x == 1 && y == 1) || (x == 1 && y == 2) || (x == 2 && y == 1))
                continue;

            if (this.worldData[x][y].isPit)
                continue;

            this.worldData[x][y].setPit();
            if (y > 1) this.worldData[x][y - 1].setBreeze();
            if (y < 4) this.worldData[x][y + 1].setBreeze();
            if (x > 1) this.worldData[x - 1][y].setBreeze();
            if (x < 4) this.worldData[x + 1][y].setBreeze();
            countPit++;
        }

        // Colocando o wumpus
        while (true) {
            x = this.rand(1, 4);
            y = this.rand(1, 4);

            if ((x == 1 && y == 1) || (x == 1 && y == 2) || (x == 2 && y == 1))
                continue;

            if (this.worldData[x][y].isPit)
                continue;

            this.worldData[x][y].setWumpus();
            // Colocando o stench próximo ao wumpus
            if (y > 1) this.worldData[x][y - 1].setStench();
            if (y < 4) this.worldData[x][y + 1].setStench();
            if (x > 1) this.worldData[x - 1][y].setStench();
            if (x < 4) this.worldData[x + 1][y].setStench();
            break;
        }

        // Colocando o ouro
        while (true) {
            x = this.rand(1, 4);
            y = this.rand(1, 4);

            if ((x == 1 && y == 1) || (x == 1 && y == 2) || (x == 2 && y == 1))
                continue;

            if (this.worldData[x][y].isPit || this.worldData[x][y].isWumpus)
                continue;

            this.worldData[x][y].setGold();
            break;
        }

        this.x = 1;
        this.y = 1;
        this.worldData[1][1].setPlayer();

        isWumpusDead = false;
        isShooting = false;

        this.drawCell();
    }

    move() {
        console.log(isWumpusDead);

        this.CalcBreezeAndStench();

        if (this.worldData[this.x][this.y].isGold) {
            this.goldFound = true;
            this.point += 1000;
            this.worldData[this.x][this.y].isGold = false;

        } else if (this.worldData[this.x][this.y].isWumpus && !isWumpusDead) {
            this.point -= 10000;
            this.gameOver = true;

        } else if (this.worldData[this.x][this.y].isPit) {
            this.point -= 10000;
            this.gameOver = true;

            // Está próximo ao wumpus?
        } else if (!isWumpusDead && this.areWeNearOfWumpus()) {
            isShooting = true;
            isWumpusDead = true;
            return this.shootDirection;

            // Está num loop do pit?
        } else if (this.areWeInPitLoop()) {
            if (this.x != 4 && this.worldVisited[this.x + 1][this.y].pitChance < 60) {
                this.randomMoves = 0;
                return this.Moves.Right;
            } else if (this.y != 4 && this.worldVisited[this.x][this.y + 1].pitChance < 60) {
                this.randomMoves = 0;
                return this.Moves.Top;
            } else if (this.x != 1 && this.worldVisited[this.x - 1][this.y].pitChance < 60) {
                this.randomMoves = 0;
                return this.Moves.Left;
            } else if (this.y != 1 && this.worldVisited[this.x][this.y - 1].pitChance < 60) {
                this.randomMoves = 0;
                return this.Moves.Bottom;
            }
        } else if (this.areWeInDangerSpace()) {
            // Se pra esquerda for seguro avance
            if (this.x != 1 && this.worldData[this.x - 1][this.y].isVisited) {
                this.worldVisited[this.x - 1][this.y].visitedNum++;
                return this.Moves.Left;
            }
            // Se pra baixo for seguro avance
            else if (this.y != 1 && this.worldData[this.x][this.y - 1].isVisited) {
                this.worldVisited[this.x][this.y - 1].visitedNum++;
                return this.Moves.Down;
            }
            // Se pra direita for seguro avance
            else if (this.x != 4 && this.worldData[this.x + 1][this.y].isVisited) {
                this.worldVisited[this.x + 1][this.y].visitedNum++;
                return this.Moves.Right;
            }
            // Se pra cima for seguro avance
            else if (this.y != 4 && this.worldData[this.x][this.y + 1].isVisited) {
                this.worldVisited[this.x][this.y + 1].visitedNum++;
                return this.Moves.Up;
            }
        } else if (this.areWeInFreeSpace) {
            // Se a direita ainda não foi visitada, avance
            if (this.x != 4 && !this.worldData[this.x + 1][this.y].isVisited) {
                this.worldVisited[this.x + 1][this.y].visitedNum++;
                return this.Moves.Right;
            }
            // Se pra cima ainda não foi visitada, avance
            else if (this.y != 4 && !this.worldData[this.x][this.y + 1].isVisited) {
                this.worldVisited[this.x][this.y + 1].visitedNum++;
                return this.Moves.Up;
            }
            // Se a esquerda ainda não foi visitada, avance
            else if (this.x != 1 && !this.worldData[this.x - 1][this.y].isVisited) {
                this.worldVisited[this.x - 1][this.y].visitedNum++;
                return this.Moves.Left;
            }
            // Se pra baixo ainda não foi visitada, avance
            else if (this.y != 1 && !this.worldData[this.x][this.y - 1].isVisited) {
                this.worldVisited[this.x][this.y - 1].visitedNum++;
                return this.Moves.Down;
            }
            // Se todos os visinhos já foram visitados, encolha um aleatório
            else {
                while (true) {
                    switch (this.rand(1, 4)) {
                        // se o número selecionado for esse vá para a direita
                        case 1:
                            if (this.x != 4) {
                                this.worldVisited[this.x + 1][this.y].visitedNum++;
                                this.randomMoves++;
                                return this.Moves.Right;
                            }
                            break;
                            // se o número selecionado for esse vá para cima
                        case 2:
                            if (this.y != 4) {
                                this.worldVisited[this.x][this.y + 1].visitedNum++;
                                this.randomMoves++;
                                return this.Moves.Up;
                            }
                            break;
                            // se o número selecionado for esse vá para a esquerda
                        case 3:
                            if (this.x != 1) {
                                this.worldVisited[this.x - 1][this.y].visitedNum++;
                                this.randomMoves++;
                                return this.Moves.Left;
                            }
                            break;
                            // se o número selecionado for esse vá para baixo
                        case 4:
                            if (this.y != 1) {
                                this.worldVisited[this.x][this.y - 1].visitedNum++;
                                this.randomMoves++;
                                return this.Moves.Down;
                            }
                            break;
                    }
                }
            }
        }
    }

    areWeNearOfWumpus() {
        // Wumpus está acima? - atirar
        if (this.y != 4 && this.worldVisited[this.x][this.y + 1].wumpusChance >= 60) {
            this.shootDirection = this.Moves.Up;
            return true;
        }
        // Wumpus está a direita - atirar
        else if (this.x != 4 && this.worldVisited[this.x + 1][this.y].wumpusChance >= 60) {
            this.shootDirection = this.Moves.Right;
            return true;
        }
        // Wumpus está a esquerda - atirar
        else if (this.x != 1 && this.worldVisited[this.x - 1][this.y].wumpusChance >= 60) {
            this.shootDirection = this.Moves.Left;
            return true;
        }
        // Wumpus está abaixo? - atirar
        else if (this.y != 1 && this.worldVisited[this.x][this.y - 1].wumpusChance >= 60) {
            this.shootDirection = this.Moves.Down;
            return true;
        }

        return false;
    }

    areWeInPitLoop() {
        if (this.randomMoves > 0 && this.worldVisited[this.x][this.y].totalMoves > 1 && this.worldData[this.x][this.y].isBreeze)
            return true;
        else
            return false;
    }

    areWeInDangerSpace() {
        console.log(this.x + " 1 " + this.y);
        if (this.worldData[this.x][this.y].isBreeze || (this.worldData[this.x][this.y].isStench && !isWumpusDead))
            return true;
        else
            return false;
    }

    areWeInFreeSpace() {
        if ((!this.worldData[this.x][this.y].isBreeze && !this.worldData[this.x][this.y].isStench) || (!this.worldData[this.x][this.y].isBreeze && this.isWumpusDead ))
            return true;
        else
            return false;
    }

    CalcBreezeAndStench() {
        //Se as células vizinhas ainda não foram calculadas
        if (!this.worldVisited[this.x][this.y].nearDanger) {
            //Se a célula tem breeze calcular a chance de ter um pit
            if (this.worldData[this.x][this.y].isBreeze) {
                this.PitWumpusPercentage(true, false);
            }

            //Se a célula tem breeze calcular a chance de ter o wumpus
            if (this.worldData[this.x][this.y].isStench && !isWumpusDead) {
                this.PitWumpusPercentage(false, true);
            }
        }
    }

    PitWumpusPercentage(pit, wumpus) {
        // adicionar porcentagem de 30% de chance de visitar a esquerda se o campo não foi visitado
        if (this.y != 1 && !this.worldData[this.x][this.y - 1].isVisited) {
            if (pit)
                this.worldVisited[this.x][this.y - 1].pitChance += 30;

            if (wumpus)
                this.worldVisited[this.x][this.y - 1].wumpusChance += 30;
        }

        // adicionar porcentagem de 30% de chance de visitar abaixo se o campo não foi visitado
        if (this.x != 4 && !this.worldData[this.x + 1][this.y].isVisited) {
            if (pit)
                this.worldVisited[this.x + 1][this.y].pitChance += 30;

            if (wumpus)
                this.worldVisited[this.x + 1][this.y].wumpusChance += 30;
        }

        // adicionar porcentagem de 30% de chance de visitar acima se o campo não foi visitado
        if (this.x != 1 && !this.worldData[this.x - 1][this.y].isVisited) {
            if (pit)
                this.worldVisited[this.x - 1][this.y].pitChance += 30;

            if (wumpus)
                this.worldVisited[this.x - 1][this.y].wumpusChance += 30;
        }

        // adicionar porcentagem de 30% de chance de visitar a direita se o campo não foi visitado
        if (this.y != 4 && !this.worldData[this.x][this.y + 1].isVisited) {
            if (pit)
                this.worldVisited[this.x][this.y + 1].pitChance += 30;

            if (wumpus)
                this.worldVisited[this.x][this.y + 1].wumpusChance += 30;
        }

        this.worldVisited[this.x][this.y].nearDanger = true;
    }

    handMove(direction) {
        if (isShooting) {
            this.gameOver = true;
            $('#status').text('Você não precisará fazer a AF!');
        } else
            switch (direction) {
                case this.Moves.Up:
                    this.worldData[this.x][this.y].unsetPlayer();
                    this.y++;
                    this.worldData[this.x][this.y].setPlayer();
                    break;

                case this.Moves.Right:
                    this.worldData[this.x][this.y].unsetPlayer();
                    this.x++;
                    this.worldData[this.x][this.y].setPlayer();
                    break;

                case this.Moves.Down:
                    this.worldData[this.x][this.y].unsetPlayer();
                    this.y--;
                    this.worldData[this.x][this.y].setPlayer();
                    break;

                case this.Moves.Left:
                    this.worldData[this.x][this.y].unsetPlayer();
                    this.x--;
                    this.worldData[this.x][this.y].setPlayer();
                    break;
            }

        this.point -= 1;
        this.drawCell();
    }

    drawCell() {
        for (var i = 1; i <= 4; i++) {
            for (var j = 1; j <= 4; j++) {
                var cell = this.worldData[i][j];

                var img = "";
                if (cell.isPlayer && isShooting) {
                    img = "player_win.png";
                    isShooting = false;
                } else if (cell.isPlayer)
                    img = "player.png";
                else if (cell.isPit)
                    img = "pit.png";
                else if (cell.isStench && cell.isBreeze && cell.isGold)
                    img = "gold.png";
                else if (cell.isStench && cell.isBreeze)
                    img = "breeze_stench.png";
                else if (cell.isWumpus && cell.isBreeze && isWumpusDead)
                    img = "wumpus_dead.png";
                else if (cell.isWumpus && cell.isBreeze)
                    img = "wumpus.png";
                else if (cell.isWumpus && isWumpusDead)
                    img = "wumpus_dead.png";
                else if (cell.isWumpus)
                    img = "wumpus.png";
                else if (cell.isGold)
                    img = "gold.png";
                else if (cell.isBreeze)
                    img = "breeze.png";
                else if (cell.isStench)
                    img = "stench.png";
                else
                    img = "";

                $(".pboard .cell" + cell.x + "" + cell.y).css("background", "url(files/img/" + img + ") no-repeat #efefef");

                if (cell.isPlayer)
                    $(".mboard .cell" + cell.x + "" + cell.y).css("background", "url(files/img/player.png) no-repeat #d0d0d0");

                if (cell.isVisited)
                    $(".mboard .cell" + cell.x + "" + cell.y).css("background-color", "#d0d0d0");
            }
        }

        $('#points').text('Pontos: ' + this.point);
    }

    rand(min, max) {
        if (min == max)
            return min;

        var date = new Date();
        var count = date.getMilliseconds() % 10;

        for (var i = 0; i <= count; ++i)
            Math.random();

        if (min > max) {
            min ^= max;
            max ^= min;
            min ^= max;
        }

        return Math.floor((Math.random() * (max - min + 1)) + min);
    }
}