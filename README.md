# AlexCrosthwaite-a2
a2 created for AlexCrosthwaite
* * *
## Project Requirements (Implemented)
1.  Implement the assignment clearly, understandably, and with extensive comments. See README.md

2.  Set up a simple WebGL capable HTML canvas able to display without error. Initialize it with a size of 960x540, the z-buffer enabled and cleared to a black background. Implement necessary shader codes without error.

3.  Develop a function capable of generating the geometry for a sphere with different complexity based on a function parameter.

4.  Extend the sphere function to generate normal vectors for flat or smooth shading based on a function parameter.

      A cross-product was used to generate per primitive normals. The points themselves were used to generate per vertex normals.
    
5.  Create a small solar system. One sun with four oribiting planets. Choose a a location and diameter for the sun as well as
    the orbital radius, diameter, and orbiting speeds for each planet.
    
      Specific sizes were chosen for each planet based on aesthetics. The orbital speed of each planet was generated to be slower with increasing radius.
    
6.  Implement a point light source at the location of the sun. Implement the following colors:
    
    >First,	an	icy	white,	faceted,	diamond-like	planet	with	medium-low	complexity	sphere,	flat	
shaded.
Second,	a	swampy,	watery	green	planet with	medium-low	complexity	sphere,	Gouraud	
shaded	with	specular	highlight.	
Third,	a	planet	covered	in	clam	smooth	water	with	high	complexity,	Phong	shaded and	
specular	highlight.
Forth,	a mud	covered	planet,	brownish-orange	with	a	dull	appearance	with	medium-high	
complexity and	no	specular	highlight

      Colors were modified until the aesthetic properties of each planet were met.
      
7. Implement respective shading models in their appropriate locations.
  
    Flat shading and gouraud shading were both implement in the vertex shader since the calculations were done exactly the same.
    Flat shading used the same normal for each vertex, which implemented the per vertex style of shading. Gourad shading used the true normal
    for each vertex and interpolated the color across the the primitive. Phong shading was implemented in the fragment shader using the interpolated 
    true normals rather than the interpolated colors.
    
8. Implement a keyboard navigation system (re-used from assignment 1)

* * *

##Project Requirements (Not Implemented)

All project requirements were implemented.

* * *

##Extra Credit Requirements (Implemented)
  1. Add a moon orbiting around one of your planets. Choose its properties.

      A moon was added to the mud planet with the exact same properties as the mud planet except it has a lower complexity. The moon
      is the same because it is a detached part of the planet. This was done by adding transformations to the model matrix which accounted
      for translating and rotating around the planet in question.
      
  2. Define and Document a key, of your choice, that will allow the eye point to attach/detach to one of the orbiting planets. When orbiting, only the
     heading should be allowed to changed by the user. The eye point can be placed at any point around the planet.
     
      The 'a' key was chosen to attach to a planet. This was implemented by using a boolean value to tell whether the camera is attached to the planet.
      When true, the view matrix was generated using lookAt rather than perspective. The eye point was placed slightly outside of the planet (inside of its orbital radius).
      
  3. Manage your code development and submission using the CS174a GitHub repository.
  
      Yes.
      
  4. Early Submission when using GitHub
  
      Yes.
