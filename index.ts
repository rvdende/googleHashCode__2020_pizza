import * as fs from 'fs';

interface PizzaCalc {
    score : bigint;
    order : number[];
    possiblePizzas: number[];
}

class PizzaSolver {
    inputFilename= 'notset';
    maxSlices : BigInt = 0n;
    pizzaTypesCount = 0;
    pizzaTypes: number[] = [];

    constructor(filename: string) {
        this.importPizzaData(filename);
    }

    importPizzaData(filename:string) {
        fs.readFile(filename,(err,data) => {
            if (err) { console.error(err); }
            if (data) {
                this.inputFilename = filename;
                const a = data.toString().trim().split('\n');
                // console.log(a);

                const firstLine = a[0].split(' ');
                // console.log(firstLine);
                this.maxSlices = BigInt(parseInt(firstLine[0], 10));
                this.pizzaTypesCount = parseInt(firstLine[1], 10);
                console.log('maxSlices: ' + this.maxSlices)
                console.log('pizzaTypesCount: ' + this.pizzaTypesCount)

                const secondLine = a[1].split(' ');
                this.pizzaTypes = secondLine.map( (p) => { return parseInt(p,10);} )
                // console.log(this.pizzaTypes);

                if (this.pizzaTypes.length !== this.pizzaTypesCount) {
                    console.error('Invalid data. Pizza types count wrong.')
                    return;
                }

                // do calc
                // this.calculateSolution(); // manual brute force
                this.tryMany();
            }
        });
    }

    /** brute force calc.. takes too long from c_medium onwards. */
    calculateSolution() {
        console.log('====== CALCULATING ======')
        let bestScore : BigInt = 0n;
        let bestOrder : number[] = [];

        // const possibilities  = BigInt(Math.pow(2, this.pizzaTypes.length) -1);
        const possibilities : bigint  = this.pow(2n, BigInt(this.pizzaTypes.length)) - 1n;
        console.log(possibilities.toString().length);

        for (let x = 0; x < possibilities; x++) {
             const binstr = x.toString(2).split('').reverse();
             while(binstr.length < this.pizzaTypes.length) {
                 binstr.push('0')
             }
             // console.log(binstr);
             const order : number[] = [];
             // console.log(order);
             for (const z in binstr) {
                if (binstr[z] === '1') { order.push( parseInt(z,10)); }
             }

             // console.log(order);

             const score = this.testOrder(order);
             if (score > bestScore) {
                 bestScore = score;
                 bestOrder = order;
                 console.log('new bestScore: ' + bestScore)
                 //console.log(bestOrder);
                 if (bestScore === this.maxSlices) { break;}
             }
        }

        // console.log('bestScore: ' + bestScore)
        // console.log(bestOrder);
        // this.printOrder(bestOrder);
    }

    pow(base:bigint,power:bigint):bigint {
        let result : bigint = 1n;

        for (let x = 0; x < power; x++ ) {
            result = result * base;
        }

        return result;
    }

    tryMany() {

        let bestScore:any = 0n;
        let bestSolution:any = {};

        for (var a = 0; a < 20; a++) {
            console.log(a);
            let pizzaOrder = this.generateBase(); // new mutation method
            if (pizzaOrder.score >= bestScore) {
                bestScore = pizzaOrder.score;
                bestSolution = pizzaOrder;
                console.log(bestScore)
            }
        }
        let pizzaOrder : PizzaCalc = bestSolution;
        // this.PrintOrderDetails(pizzaOrder);
        this.printOrder(pizzaOrder);

    }




    mutateOrder(pizzaOrder: PizzaCalc) : PizzaCalc {
        console.log('mutating order');
        this.calculateScore(pizzaOrder);

        const diff : bigint = BigInt(this.maxSlices) - pizzaOrder.score;

        console.log('We have '+diff+' to go')
        // console.log(pizzaOrder.order)
        // console.log(pizzaOrder.possiblePizzas)
        console.log(this.pizzaIndexToSlices(pizzaOrder.order));
        console.log(this.pizzaIndexToSlices(pizzaOrder.possiblePizzas));

        // add smallest to fill up

        if (this.pizzaIndexToSlices(pizzaOrder.possiblePizzas).length > 0) {
            if (this.pizzaIndexToSlices(pizzaOrder.possiblePizzas)[0] <= diff) {
                pizzaOrder.order.push(pizzaOrder.possiblePizzas[0])
                pizzaOrder.order = pizzaOrder.order.sort();
                pizzaOrder.possiblePizzas = pizzaOrder.possiblePizzas.slice(1).sort();;
            }
        } else {
            console.log('stuck');
            console.log(pizzaOrder);
        }

        // calc score again
        this.calculateScore(pizzaOrder);

        return pizzaOrder;
    }

    pizzaIndexToSlices(pizzaIndex: number[]) : number[] {
        const slices : number[] = [];
        for (const p of pizzaIndex) {
            slices.push(this.pizzaTypes[p])
        }
        return slices;
    }


    calculateScore ( pizzaOrder:PizzaCalc ) : PizzaCalc {
        let score : bigint = 0n;
        for (const p of pizzaOrder.order) {
            score += BigInt(this.pizzaTypes[p]);
        }
        pizzaOrder.score = score;
        return pizzaOrder;
    }

    generateBase() : PizzaCalc {
        const possiblePizzas : number[] = []
        for (let x = 0; x < this.pizzaTypes.length; x++) {
            possiblePizzas.push(x);
        }

        let order : number[] = [];
        let score = 0n;
        let done = false;

        while (!done) {

            if (possiblePizzas.length === 0) { 
                console.log('no possible pizzas');
                break;
            }

            const randomPizza : number = possiblePizzas[Math.round(Math.random() * (possiblePizzas.length-1))];
            const val = this.pizzaTypes[randomPizza]

            if ((score + BigInt(val)) > this.maxSlices) {
                done = true;
                break;
            }

            if ((score + BigInt(val)) === this.maxSlices) {
                done = true;
            }

            possiblePizzas.splice(possiblePizzas.indexOf(randomPizza),1)
            order.push(randomPizza);
            order = order.sort();
            score = this.testOrder(order);

        }

        return { score, order, possiblePizzas};
    }


    testOrder(order: number[]) : bigint {
        const pizzaSlices = [];
        for (const a of order) { pizzaSlices.push(this.pizzaTypes[a]); }
        let score: bigint = 0n;
        for (const p of pizzaSlices) {
            score += BigInt(p);
        }

        return score;
        // if (score > this.maxSlices) {
        //     return BigInt(0);
        // } else {
        //     return score;
        // }
    }

    printOrder(orderIn: PizzaCalc) {

        const order = orderIn.order;
        console.log('======= ORDER ========')
        let orderString = '';
        orderString += order.length.toString() + '\n';
        for (const o of order) {
            orderString += o + ' ';
        }
        console.log(orderString);

        fs.writeFile(this.inputFilename+'.solution',orderString,(err)=>{
            if (err) console.error(err);
        })
    }

    PrintOrderDetails (pizzaOrder: PizzaCalc) {
        console.log(pizzaOrder)
        const selectedPizzas = this.pizzaIndexToSlices(pizzaOrder.order);
        console.log('Selected Pizzas: ('+selectedPizzas.length+')')
        console.log(selectedPizzas);
        console.log('From options:')
        console.log(this.pizzaTypes);
        console.log('Unselected Pizzas:')
        console.log(this.pizzaIndexToSlices(pizzaOrder.possiblePizzas))
    }

}

// const solver = new PizzaSolver('a_example.in');
// const solver = new PizzaSolver('b_small.in');
// const solver = new PizzaSolver('c_medium.in');
// const solver = new PizzaSolver('d_quite_big.in');
const solver = new PizzaSolver('e_also_big.in');