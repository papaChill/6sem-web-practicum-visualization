// Входные данные:
//   data - исходный массив (например, buildings)
//   key - поле, по которому осуществляется группировка

function createArrGraph(data, key) {  
  
    const groupObj = d3.group(data, d => d[key]);

    let arrGraph =[];
    for(let entry of groupObj) {
        const minMax = d3.extent(entry[1].map(d => d['Высота']));
        arrGraph.push({labelX : entry[0], values : minMax});
    }
    if (key === "Год") {
        arrGraph.sort((a, b) => d3.ascending(a.labelX, b.labelX));
    }
    return arrGraph;
}

function drawGraph(data, dataForm) {
    
    const svg = d3.select("svg")  
    svg.selectAll('*').remove();

    let arrGraph = createArrGraph(data, dataForm.ox);

    // создаем словарь с атрибутами области вывода графика
    const attr_area = {
        width: parseFloat(svg.style('width')),
        height: parseFloat(svg.style('height')),
        marginX: 50,
        marginY: 50
    }
       
    // создаем шкалы преобразования и выводим оси
    const [scX, scY] = createAxis(svg, arrGraph, attr_area, dataForm.showMin, dataForm.showMax);
    
    // рисуем график
    createChart(svg, arrGraph, scX, scY, attr_area, dataForm)        
}

function createAxis(svg, data, attr_area, showMin, showMax){
    // находим интервал значений, которые нужно отложить по оси OY 
    // максимальное и минимальное значение и максимальных высот по каждой стране
    let allValues = [];
    if (showMax) allValues.push(...data.map(d => d.values[1]));
    if (showMin) allValues.push(...data.map(d => d.values[0]));
    const [min, max] = d3.extent(allValues);

    // функция интерполяции значений на оси
    // по оси ОХ текстовые значения
    const scaleX = d3.scaleBand()
                    .domain(data.map(d => d.labelX))
                    .range([0, attr_area.width - 2 * attr_area.marginX]);
                    
    const scaleY = d3.scaleLinear()
                    .domain([min * 0.85, max * 1.1 ])
                    .range([attr_area.height - 2 * attr_area.marginY, 0]);               
     
     // создание осей
    const axisX = d3.axisBottom(scaleX); // горизонтальная 
    const axisY = d3.axisLeft(scaleY); // вертикальная

     // отрисовка осей в SVG-элементе
    svg.append("g")
        .attr("transform", `translate(${attr_area.marginX}, 
                                      ${attr_area.height - attr_area.marginY})`)
        .call(axisX)
        .selectAll("text") // подписи на оси - наклонные
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", d => "rotate(-45)");
    
    svg.append("g")
        .attr("transform", `translate(${attr_area.marginX}, ${attr_area.marginY})`)
        .call(axisY);
        
    return [scaleX, scaleY]
}

function createChart(svg, data, scaleX, scaleY, attr_area, dataForm) {
    const r = 4;

    const group = svg.append("g")
       .attr("transform", `translate(${attr_area.marginX}, ${attr_area.marginY})`);

    if (dataForm.type === "scatter") {
        if (dataForm.showMax) {
            group.selectAll(".dot-max")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "dot-max")
                .attr("r", r)
                .attr("cx", d => scaleX(d.labelX) + scaleX.bandwidth() / 2)
                .attr("cy", d => scaleY(d.values[1]))
                .style("fill", "red");
        }
    
        if (dataForm.showMin) {
            group.selectAll(".dot-min")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "dot-min")
                .attr("r", r)
                .attr("cx", d => scaleX(d.labelX) + scaleX.bandwidth() / 2)
                .attr("cy", d => {
                    const y = scaleY(d.values[0])
                    return d.values[0] === d.values[1] ? y + 2 : y;
                })
                .style("fill", "blue");
        }
    } else {
        const gr = 0.7;
        const need = scaleX.bandwidth() * gr;
        const barWidth = (dataForm.showMax && dataForm.showMin) ? need / 2 : need;
        
        if (dataForm.showMax) {
            group.selectAll(".bar-max").data(data).enter().append("rect")
                .attr("x", d => scaleX(d.labelX))
                .attr("y", d => scaleY(d.values[1]))
                .attr("width", barWidth)
                .attr("height", d => (scaleY.range()[0] - scaleY(d.values[1])))
                .style("fill", "red");
        }
        if (dataForm.showMin) {
            group.selectAll(".bar-min").data(data).enter().append("rect")
                .attr("x", d => scaleX(d.labelX) + (dataForm.showMax ? barWidth : 0))
                .attr("y", d => scaleY(d.values[0]))
                .attr("width", barWidth)
                .attr("height", d => (scaleY.range()[0] - scaleY(d.values[0])))
                .style("fill", "blue");
        }
    }
        
}