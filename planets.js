var canvas;
var gl;

var lightAmbient = vec4(0.3, 0.3, 0.3, 1.0);
var lightDiffuse = vec4(0.1, 0.1, 0.0, 1.0);
var lightSpecular = vec4(0.5, 0.5, 0.5, 1.0);

var points = [];
var normalsArray = [];
var planets = [];

var projection, projectionLoc;
var modelView, modelViewLoc;
var ambientProduct, ambientProductLoc;
var diffuseProduct, diffuseProductLoc;
var specularProduct, specularProductLoc;
var sunMatrixLoc, shininessLoc;
var isSunLoc, shadingLoc;

var attach = false;

var viewMatrix, modelMatrix;

//variables for camera
var camera = {
    x : 0,
    y : 0,
    z : -60,
    fovx : 45,
    near : 0.1, 
    far : 90,
    aspect : undefined,
    heading : 0
}

//Needed for matrix times vector
function matTimesVec(mat, vec)
{   
    var result = [];

    //assume mat and vec are same length
    for(var i = 0; i < mat.length; i++){
        var sum = 0;
        for(var j = 0; j < vec.length; j++){
            sum += mat[i][j] * vec[j];
        }
        result.push(sum);
    }
    return result;
}

//function for generating sphere geometry with different complexities and normals for different shadings
function sphere(nDiv, shading){
    function tetrahedron(a, b, c, d, nDiv, shading){
        divideTriangle(a, b, c, nDiv, shading);
        divideTriangle(d, c, b, nDiv, shading);
        divideTriangle(a, d, b, nDiv, shading);
        divideTriangle(a, c, d, nDiv, shading);
    }

    function divideTriangle(a, b, c, count, shading) {
        if ( count > 0 ) {
                    
            var ab = mix( a, b, 0.5);
            var ac = mix( a, c, 0.5);
            var bc = mix( b, c, 0.5);
                    
            ab = normalize(ab, true);
            ac = normalize(ac, true);
            bc = normalize(bc, true);
                                    
            divideTriangle( a, ab, ac, count - 1, shading);
            divideTriangle( ab, b, bc, count - 1, shading);
            divideTriangle( bc, c, ac, count - 1, shading);
            divideTriangle( ab, bc, ac, count - 1, shading);
        }
        else { 
            triangle( a, b, c, shading);
        }
    }

    function triangle(a, b, c, shading) {
         points.push(a);
         points.push(b);      
         points.push(c);
        
         //normals are vectors
         
         //Single normal per triangle
        if (shading == 0){
            var t1 = subtract(b, a);
            var t2 = subtract(c, a);
            var normal = normalize(cross(t2, t1));
            normal = vec4(normal);
            normal[3] = 0.0;

            normalsArray.push(normal);
            normalsArray.push(normal);
            normalsArray.push(normal);
        }
        if (shading == 1 || shading == 2){
            normalsArray.push(vec4(a[0],a[1], a[2], 0.0));
            normalsArray.push(vec4(b[0],b[1], b[2], 0.0));
            normalsArray.push(vec4(c[0],c[1], c[2], 0.0));
        }
    }

    //initial tetrahedron points
    var va = vec4(0.0, 0.0, -1.0,1);
    var vb = vec4(0.0, 0.942809, 0.333333, 1);
    var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
    var vd = vec4(0.816497, -0.471405, 0.333333,1);
    tetrahedron(va, vb, vc, vd, nDiv, shading);
}

function Planet(radius, size, complexity, shading, material)
{
    this.radius = radius;
    this.size = size;
    this.complexity = complexity;
    this.shading = shading;
    this.material = material;

    this.theta = (Math.random() * 1000) % 360;

    this.startIndex = points.length;
    sphere(complexity, shading);
    this.numPoints = points.length - this.startIndex;
}

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable(gl.DEPTH_TEST);

    camera.aspect = canvas.width/canvas.height;

    //Sun
    planets.push(new Planet(0.0, 3.0, 5, 0, {
        ambient : vec4(1.0, 1.0, 0.0, 1.0),
        shininess : 0.0 }));

    //Ice planet
    planets.push(new Planet(14, 1.5, 2, 0, {
        ambient : vec4(0.6, 0.9, 0.9, 1.0),
        diffuse : vec4(0.0, 1.0, 1.0, 1.0),
        specular : vec4(1.0, 1.0, 1.0, 1.0),
        shininess : 10.0 }));

    //Swampy planet
    planets.push(new Planet(8, 0.7, 3, 1, {
        ambient : vec4(0.0, 0.4, 0.4, 1.0),
        diffuse : vec4(0.0, 0.4, 0.2, 1.0),
        specular : vec4(1.0, 1.0, 1.0, 1.0),
        shininess : 20.0 }));

    //Water planet
    planets.push(new Planet(10, 0.9, 5, 2, {
        ambient :  vec4(0.2, 0.6, 1.0, 1.0),
        diffuse : vec4(0.2, 0.6, 1.0, 1.0),
        specular : vec4(1.0, 1.0, 1.0, 1.0),
        shininess : 60 }));

    //Mud planet
    planets.push(new Planet(5, 1.0, 3, 1, {
        ambient : vec4(0.4, 0.2, 0.0, 1.0),
        diffuse : vec4(0.4, 0.2, 0.0, 1.0),
        specular : vec4(0.0, 0.0, 0.0, 1.0),
        shininess : 100.0 }));

    //Mud moon
    planets.push(new Planet(1.8, 0.2, 2, 1, {
        ambient : vec4(0.4, 0.2, 0.0, 1.0),
        diffuse : vec4(0.4, 0.2, 0.0, 1.0),
        specular : vec4(0.0, 0.0, 0.0, 1.0),
        shininess : 100.0 }));

    planets[planets.length - 1].isMoon = true;


    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.DYNAMIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    projectionLoc = gl.getUniformLocation(program, "projection");
    modelViewLoc = gl.getUniformLocation(program, "modelView");
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    sunMatrixLoc = gl.getUniformLocation(program, "sunMatrix");
    shininessLoc = gl.getUniformLocation(program, "shininess");
    isSunLoc = gl.getUniformLocation(program, "isSun");
    shadingLoc = gl.getUniformLocation(program, "shading");

    window.onkeypress = function(event) {
    	var key = String.fromCharCode(event.keyCode).toLowerCase();
    	switch(key){
            case 'a': //Attach/detach from a planet
            attach = !attach;
            camera.x = 0;
            camera.y = 0;
            camera.z = -60;
            camera.fovx = 45;
            camera.heading = 0;
            break;
            case 'r': //Reset the position of the cubes to the original specifications
            attach = false;
            camera.x = 0;
            camera.y = 0;
            camera.z = -60;
            camera.fovx = 45;
            camera.heading = 0;
            break;
            case 'i': //Account for the current heading and move the camera forward in that direction
            camera.z += 0.25*Math.cos(radians(camera.heading));
            camera.x -= 0.25*Math.sin(radians(camera.heading));
            break;
            case 'j': //Account for the current heading and move the camera left in that direction
            camera.x += 0.25*Math.cos(radians(camera.heading));
            camera.z += 0.25*Math.sin(radians(camera.heading));
            break;
            case 'k': //Account for the current heading and move the camera right in that direction
            camera.x -= 0.25*Math.cos(radians(camera.heading));
            camera.z -= 0.25*Math.sin(radians(camera.heading));
            break;
            case 'm': //Account for the current heading and move the camera down in that direction
            camera.z -= 0.25*Math.cos(radians(camera.heading));
            camera.x += 0.25*Math.sin(radians(camera.heading));
            break;
            case 'n': //Make the field of nnnnnview narrower
            camera.fovx -= 1;
            break;
            case 'w': //Make the field of view wider
            camera.fovx += 1;
            break;
    	}
    }
    
    window.onkeydown = function(event) {
        var key = event.keyCode;
        switch(key){
            case 38: //Up arrow key
            camera.y -= 0.25;
            break;
            case 40: //Down arrow key
            camera.y += 0.25;
            break;
            case 37: //Left arrow key
            camera.heading -= 1;
            break;
            case 39: //Right arrow key
            camera.heading += 1;
            break;
        }
    }

    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    projection = perspective(camera.fovx / camera.aspect, camera.aspect, camera.near, camera.far);
    gl.uniformMatrix4fv(projectionLoc, false, flatten(projection));

    if(attach == true){
        //If we are attached to a planet, generate the view matrix using lookAt with the eye located at the
        //planet in question
        var planet = planets[1];
        var rot = rotate(planet.theta, [0, 1, 0]);
        var pos = vec4(planet.radius - 2, 0, 0, 1);
        var eye = matTimesVec(rot, pos);
        eye = [eye[0], eye[1], eye[2]];
        rot = rotate(camera.heading, [0, -1, 0]);
        var at = subtract([0, 0, 0], eye);
        at[3] = 1;
        at = matTimesVec(rot, at);
        at = at.slice(0, 3);
        at = add(at, eye);

        viewMatrix = lookAt(eye, at, [0, 1, 0]);
    }
    else{
        //If not attached, generate the view matrix using he camera coordinates
        viewMatrix = mult(rotate(camera.heading, [0, 1, 0]), translate(camera.x, camera.y, camera.z));
        viewMatrix = mult(rotate(30, [1, 0, 0]), viewMatrix);
        viewMatrix = mult(translate(0, Math.sin(Math.PI/6) * camera.z, 0), viewMatrix);
    }

    for(var i = 0; i < planets.length; i++)
    {   
        if (planets[i].isMoon == true)
        {   
            //If we are drawing the moon, account for the translation and rotation around the planet it is orbiting.
            modelMatrix = mult(rotate(planets[i].theta, [0, 1, 0]), translate(planets[i].radius, 0, 0));
            modelMatrix = mult(modelMatrix, scale(planets[i].size, planets[i].size, planets[i].size));
            modelMatrix = mult(translate(planets[planets.length-2].radius, 0, 0), modelMatrix);
            modelMatrix = mult(rotate(planets[planets.length-2].theta, [0, 1, 0]), modelMatrix);
        }
        else
        {   
            //Otherwise, just account for the translation and rotation around the sun
            modelMatrix = mult(rotate(planets[i].theta, [0, 1, 0]), translate(planets[i].radius, 0, 0));
            modelMatrix = mult(modelMatrix, scale(planets[i].size, planets[i].size, planets[i].size));
        }

        modelView = mult(viewMatrix, modelMatrix);
        gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelView));
    
        if (i == 0) {
            //Send in color data for the sun
            gl.uniformMatrix4fv(sunMatrixLoc, false, flatten(modelView));
            gl.uniform1i(isSunLoc, false, 1);
            gl.uniform4fv(ambientProductLoc, planets[i].material.ambient);
        }
        else{
            //send in color data for each planet
            gl.uniform1i(isSunLoc, false, 0);
            gl.uniform1i(shadingLoc, planets[i].shading);
            ambientProduct = mult(lightAmbient, planets[i].material.ambient);
            diffuseProduct = mult(lightDiffuse, planets[i].material.diffuse);
            specularProduct = mult(lightSpecular, planets[i].material.specular);
            gl.uniform4fv(ambientProductLoc, ambientProduct);
            gl.uniform4fv(diffuseProductLoc, diffuseProduct);
            gl.uniform4fv(specularProductLoc, specularProduct);
            gl.uniform1f(shininessLoc, planets[i].material.shininess);
        }

        gl.drawArrays( gl.TRIANGLES, planets[i].startIndex, planets[i].numPoints);

        if (i > 0)
        {   
            //rotate all the planets
            if(planets[i].isMoon == true)
                planets[i].theta -= 3/planets[i].radius;
            planets[i].theta += 5/planets[i].radius;
            planets[i].theta %= 360;
        }
    }
    requestAnimFrame( render );
}