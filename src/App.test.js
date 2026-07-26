import {
  currentDate,
  currentTime,
  formatDate,
  rounded,
  formatTime,
  formatCurrency,
  formatDecimal,
  formatNumberWithZeros,
} from './helper/utils.helper';

/**
 * 
 * toBe en Jest se utiliza para comparar si dos valores son exactamente iguales. 
 * Puedes usarla para realizar pruebas en Jest cuando necesites verificar que dos valores sean idénticos.
  
  test('ejemplo de prueba con toBe', () => {
    const resultado = 2 + 2;
    expect(resultado).toBe(4);
  });

  * toEqual: Esta función se utiliza para comparar si dos valores son iguales en contenido. 
  * Es útil cuando quieres comparar el contenido de dos objetos o arrays, en lugar de su referencia en memoria.
  
  test('ejemplo de prueba con toEqual', () => {
    const objeto1 = { a: 1, b: 2 };
    const objeto2 = { a: 1, b: 2 };
    expect(objeto1).toEqual(objeto2);
  });

  * toContain: Esta función se utiliza para verificar si un valor está presente en un array o en una cadena. 
  * Puedes usarla para comprobar si un elemento específico está presente en un array o si una subcadena está presente en una cadena.
  
  test('ejemplo de prueba con toContain', () => {
    const array = [1, 2, 3, 4, 5];
    expect(array).toContain(3);
  });

  * toMatchObject: Esta función se utiliza para verificar si un objeto contiene las mismas propiedades y valores que otro objeto. 
  * Es útil cuando quieres comprobar si un objeto tiene una estructura específica, sin necesidad de comparar todos sus valores.
  
  test('ejemplo de prueba con toMatchObject', () => {
    const objeto = { a: 1, b: 2, c: 3 };
    expect(objeto).toMatchObject({ a: 1, b: 2 });
  });

  * toHaveLength: Esta función se utiliza para verificar si un array o una cadena tiene una longitud específica. 
  * Puedes usarla para comprobar si un array tiene un número determinado de elementos o si una cadena tiene una longitud específica.
  
  test('ejemplo de prueba con toHaveLength', () => {
    const cadena = 'Hola, mundo!';
    expect(cadena).toHaveLength(12);
  });

  * En Jest, puedes utilizar la función Array.isArray() para verificar si un valor es un array. 
  * Esta función devuelve true si el valor es un array y false en caso contrario. 
  * Aquí tienes un ejemplo de cómo usar Array.isArray() en Jest:
  
  test('ejemplo de prueba para verificar si es un array', () => {
    const array = [1, 2, 3];
    expect(Array.isArray(array)).toBe(true);
  });

  * Para verificar si un valor es un objeto, puedes utilizar la función typeof para comprobar si el tipo de dato es "object". 
  * Sin embargo, ten en cuenta que typeof null también devuelve "object", por lo que es posible que desees realizar una comprobación adicional para asegurarte de que no sea nulo. 
  * Aquí tienes un ejemplo de cómo verificar si un valor es un objeto en Jest:
  
  test('ejemplo de prueba para verificar si es un objeto', () => {
    const objeto = { a: 1, b: 2 };
    expect(typeof objeto === 'object' && objeto !== null).toBe(true);
  });

  * Para usar la función toMatch en Jest, puedes utilizarla para verificar si una cadena coincide con una expresión regular. 
  * Aquí tienes un ejemplo de cómo usar toMatch en Jest.
  
  test('ejemplo de prueba con toMatch', () => {
    const cadena = 'Hola, mundo!';
    expect(cadena).toMatch(/mundo/);
  });

  */