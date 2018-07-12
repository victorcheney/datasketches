function createCentralCircleLayout(opts_data, focus, m, w, h, map_id) {

    let current_center_const = "all" //constellation (group) currently visible in the center
    let constellations, chosen_const
    let const_names = opts_data.const_names
    let location
    let timeout_switch

    ////////////////////////////// Set sizes ///////////////////////////////

    let margin = { left: m, top: m, right: m, bottom: m }
    let width = w
    let height = h
    let total_width = margin.left + width + margin.right
    let total_height = margin.top + height + margin.bottom

    ////////////////////////////// Create Canvases ///////////////////////////////

    d3.select("#canvas-" + map_id).remove()
    d3.select("#canvas-mini-" + map_id).remove()
    d3.select("#svg-" + map_id).remove()

    //Create the canvas
    const canvas = d3.select("#chart-" + map_id).append("canvas")
        .attr("id", "canvas-" + map_id)
        .attr("class", "canvas-circular")
    const ctx = canvas.node().getContext("2d")
    crispyCanvas(canvas, ctx, total_width, total_height, 0)

    const canvas_mini = d3.select("#chart-" + map_id).append("canvas")
        .attr("id", "canvas-mini-" + map_id)
        .attr("class", "canvas-circular")
    const ctx_mini = canvas_mini.node().getContext("2d")
    crispyCanvas(canvas_mini, ctx_mini, total_width, total_height, 0)

    ////////////////////////////// Create SVG ///////////////////////////////

    //Create the SVG on top
    const svg = d3.select("#chart-" + map_id).append("svg")
        .attr("id", "svg-" + map_id)
        .attr("class", "svg-circular")
        .attr("width", total_width)
        .attr("height", total_height)

    //A group for the fade-out / fade-in group when an outside mini map is clicked
    const fade_group = svg.append("g")
        .attr("class", "chart-circular-hide-group")
        .style("opacity", 1)
    //Append a rectangle that is as big as the SVG
    fade_group.append("rect")
        .attr("width", total_width)
        .attr("height", total_height)
        .style("fill", "white")
        .on("click", () => {
            clearTimeout(timeout_switch)
            timeout_switch = setTimeout(() => switchSkyMapCenter("body"), 200)
        })
    //Append text in the middle
    fade_group.append("text")
        .attr("class", "chart-circular-text")
        .attr("x", width/2 + margin.left)
        .attr("y", height/2 + margin.top - 55)
        .attr("dy", "0.35em")
        .text("Creating the Sky Map of")
    const svg_text_const_name = fade_group.append("text")
        .attr("class", "chart-circular-text-name")
        .attr("x", width/2 + margin.left)
        .attr("y", height/2 + margin.top + 0)
        .attr("dy", "0.35em")
        .text(focus.proper)
    const svg_text_culture = fade_group.append("text")
        .attr("class", "chart-circular-text-culture")
        .attr("x", width/2 + margin.left)
        .attr("y", height/2 + margin.top + 40)
        .attr("dy", "0.35em")
        .text("")

    //Create the title in the top left corner
    const title_group = svg.append("g")
        .attr("class", "chart-circular-title-group")
    let offsets = [10, 28, 78]
    title_group.selectAll(".chart-circular-title")
        .data(["The cultures & constellations", "that use the star", focus.proper])
        .enter().append("text")
        .attr("class", "chart-circular-title")
        .classed("chart-circular-star-title", (d,i) => i === 2 ? true : false)
        .attr("x", 0)
        .attr("y", (d,i) => offsets[i])
        .text(d => d)

    ////////////////////////////// Create center ///////////////////////////////

    //Get all of the constellations that include the chosen star
    constellations = opts_data.const_per_star
        .filter(d => d.star_id === focus.hip)
        .map(d => d.const_id)
        .sort()
    // console.log(chosen_const)
    
    //Create the central image of all constellations that use the chosen star
    let center_size = 650
    chosen_const = constellations
    location = {
        x: (total_width - center_size)/2, 
        y: (total_height - center_size)/2, 
        width: center_size, 
        height: center_size
    }
    drawMap(opts_data, canvas, ctx, focus, chosen_const, location, "big")

    //Fade the center out 
    fade_group.transition("fade")
        .duration(600).delay(800)
        .style("opacity", 0)
        
    ////////////////////////////// Create mini-maps ///////////////////////////////

    //Figure out the sizes of the mini constellations-only circles around the central big one
    let n_const = constellations.length
    let angle = pi / n_const
    let padding = 60
    let padding_center = 60
    let r = Math.min(90, ((center_size/2 - padding) * Math.sin(angle))/(1 - Math.sin(angle)))
    let rR = center_size/2 - padding + r + padding_center

    let stroke_w = 1.5
    breathe.times(constellations.length, i => {
    // constellations.forEach((d,i) => {
        //Find the central location
        let chosen_const = constellations[i]
        let x = rR * Math.cos((i) * 2*angle - pi1_2)
        let y = rR * Math.sin((i) * 2*angle - pi1_2)
        let location = {x: x + width/2 + margin.left - r, y: y + height/2 + margin.top - r, width: 2*r, height: 2*r}

        miniMapsCircle(ctx_mini, focus, chosen_const, location)
        //Create and draw the map on the canvas

        //Create the circle and text on the svg
        let const_color = cultures[constellationCulture(chosen_const)].color

        let const_text_group = svg.append("g")
            .attr("class", "chart-circular-mini-map-group")
            .style("color", const_color)

        //Circle and the path for the culture title
        const_text_group.append("path")
            .datum(chosen_const)
            .attr("class", "chart-circular-mini-map-circle")
            .attr("id", `chart-mini-map-path-${map_id}-${i}`)
            .attr("d", () => {
                let rad = r * size_factor
                let cx = x + width/2 + margin.left
                let cy = y + height/2 + margin.top
                return "M " + [cx, cy + rad] + " A " + [rad, rad] + " 0 1 1 " + [cx + 0.01, cy + rad] 
            })
            .style("stroke-width", stroke_w)
            .on("click touchstart", d => {
                d3.event.stopPropagation()
                clearTimeout(timeout_switch)
                timeout_switch = setTimeout(() => switchSkyMapCenter(d), 200)
            })

        //Draw the culture name on the path
        const_text_group.append("text")
            .attr("class", "chart-circular-mini-map-culture")
            .attr("dy", -5)
            .append("textPath")
            .attr("xlink:href", `#chart-mini-map-path-${map_id}-${i}`)
            .attr("startOffset", "50%")
            .text(constellationCultureCap(chosen_const))

        if(r * size_factor > 45) {
            //Create the path for the constellation name
            const_text_group.append("path")
                .attr("class", "chart-circular-mini-map-name-path")
                .attr("id", `chart-mini-map-name-path-${map_id}-${i}`)
                .attr("d", () => {
                    let rad = r * size_factor
                    let cx = x + width/2 + margin.left
                    let cy = y + height/2 + margin.top
                    return "M " + [cx, cy - rad] + " A " + [rad, rad] + " 0 1 0 " + [cx + 0.01, cy - rad] 
                })

            //Add the constellation name to the path
            const_text_group.append("text")
                .attr("class", "chart-circular-mini-map-name")
                .attr("dy", 11)
                .append("textPath")
                .attr("xlink:href", `#chart-mini-map-name-path-${map_id}-${i}`)
                .attr("startOffset", "50%")
                .text(const_names[const_names.map(c => c.const_id).indexOf(chosen_const)].const_name)
        }//if
    })//breathe constellations

    //Function to create, downscale and draw the mini constellation charts
    function miniMapsCircle(ctx, focus, chosen_const, loc) {
        let new_size, new_canvas
        
        //Get the original constellation line canvas
        const basemap = createCircularBaseMap(opts_data, focus, chosen_const, "small")

        //Down-scaling in steps to reduce anti-aliasing
        //Based on https://stackoverflow.com/a/17862644/2586314
        function drawToTemp(ctx_to_draw, size) {
            let canvas_temp = document.createElement('canvas')
            let ctx_temp = canvas_temp.getContext('2d')
            canvas_temp.width = size
            canvas_temp.height = size
            ctx_temp.fillStyle = "white"
            ctx_temp.drawImage(ctx_to_draw, 0, 0, canvas_temp.width, canvas_temp.height)

            return canvas_temp
        }//function drawToTemp
        
        //Downscale in steps
        if(sf < 2) {
            new_size = basemap_total_size / 2
            new_canvas = drawToTemp(basemap.canvas_lines, new_size)
            new_size = new_size / 2
            new_canvas = drawToTemp(new_canvas, new_size)
            ctx.drawImage(new_canvas, 0, 0, new_size, new_size, loc.x, loc.y, loc.width, loc.height)
        } else {
            new_size = basemap_total_size / 2
            ctx.drawImage(basemap.canvas_lines, loc.x, loc.y, loc.width, loc.height)
        }//else

    }//function miniMapsCircle

    ////////////////////////////// Click interaction ///////////////////////////////

    //Switch the star map in the middle to the clicked on constellation
    function switchSkyMapCenter(d) {
        let chosen

        //Don't do anything if the click comes not from a mini-map and the central map is already all
        if(d === "body" && current_center_const === "all") return
        
        if(d !== "body" && d !== current_center_const) {
            //If the same circle isn't clicked twice in a row, change to the new mini map
            chosen = d
            current_center_const = d

            //Update central text
            svg_text_culture
                .style("fill", cultures[constellationCulture(d)].color)
                .text(constellationCultureCap(d))
            //Update the constellation name
            let const_name = const_names[const_names.map(c => c.const_id).indexOf(d)].const_name
            svg_text_const_name.text(const_name)

            //Change the thick stroke of the chosen constellation
            svg.selectAll(".chart-circular-mini-map-circle")
                .transition("stroke").duration(600)
                .style("stroke-width", c => ((c === d ? 3 : 1) * stroke_w) + "px")
        } else {
            //If the same one is clicked again, go back to "all"
            chosen = chosen_const
            current_center_const = "all"

            //Update central text
            svg_text_culture.text("")
            svg_text_const_name.text("all cultures")

            //Remove the thicker stroke
            svg.selectAll(".chart-circular-mini-map-circle")
                .transition("stroke").duration(600)
                .style("stroke-width", stroke_w + "px")
        }//else

        //Fade the center in and out 
        fade_group
            .transition("fade").duration(600)
            .style("opacity", 1)
            .on("end", function() {
                //Draw the new map
                drawMap(opts_data, canvas, ctx, focus, chosen, location, "big")
                //Fade back in
                d3.select(this)
                    .transition("fade").duration(600).delay(1000)
                    .style("opacity", 0)
            })

    }//function switchSkyMapCenter

}//function createCentralCircleLayout