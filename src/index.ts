import invoices from "./invoices";
import plays from "./plays";

function statement(invoice, plays) {
    const statementData = {
        customer: invoice.customer,
        performances: invoice.performances.map(enrichPerformance)
    };
    return renderPlainText(statementData)

    function enrichPerformance(aPerformance) {
        const result = Object.assign({}, aPerformance);
        result.play = playFor(result);
        return result;
    }

    function playFor(aPerformance) {
        return plays[aPerformance.playId]
    }


    function renderPlainText(data) {
        let result = `청구 내역 (고객명 ${data.customer}\n`;

        for (let perf of data.performances) {
            result += `${playFor(perf).name}: ${usd(amountFor(perf))} (${perf.audience}석)\n`;
        }

        result += `총액 : ${usd(totalAmount())}\n`;
        result += `적립 포인트: ${totalVolumeCredits()}점\n`;
        return result;

        function totalAmount() {
            let result = 0;
            for (let perf of data.performances) {
                result += amountFor(perf);
            }
            return result;
        }


        function totalVolumeCredits() {
            let result = 0;
            for (let perf of data.performances) {
                result += volumeCreditsFor(perf);
            }
            return result;
        }

        function volumeCreditsFor(aPerformance) {
            let result = 0
            result += Math.max(aPerformance.audience - 30, 0);
            if ("comedy" === playFor(aPerformance).type) result += Math.floor(aPerformance.audience / 5);

            return result
        }

        function amountFor(aPerformance) {
            let result = 0;

            switch (playFor(aPerformance).type) {
                case 'tragedy':
                    result = 40000;
                    if (aPerformance.audience > 30) {
                        result += 1000 * (aPerformance.audience - 30);
                    }
                    break;
                case "comedy":
                    result = 30000;
                    if (aPerformance.audience > 20) {
                        result += 10000 + 500 * (aPerformance.audience - 20);
                    }
                    result += 300 * aPerformance.audience;
                    break;
                default:
                    throw new Error(`알수없는장르: ${playFor(aPerformance).type}`)
            }

            return result;
        }
    }
}

function usd(aNumber) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    }).format(aNumber / 100);
}


console.log(statement(invoices[0], plays));