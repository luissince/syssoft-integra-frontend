import { render, screen } from '@testing-library/react';
import App from './components/menu/Menu';
import {
  currentDate,
  currentTime,
  formatDate,
  rounded,
  formatTime,
  formatCurrency,
  imageBase64,
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

describe('formatDate function', () => {
  it('Prueba de formato de fecha válido', () => {
    const inputDate = '2023-10-09';
    const expectedOutput = '09/10/2023';
    expect(formatDate(inputDate)).toBe(expectedOutput);
  });

  // it('Prueba de formato de fecha inválido', () => {
  //   const inputDate = '2023-99-99'; // Fecha inválida
  //   const expectedOutput = 'Invalid Date';
  //   expect(dateFormat(inputDate, 'yyyy-MM-dd', 'dd/MM/yyyy')).toBe(expectedOutput);
  // });

  // it('Prueba de manejo de diferentes formatos de entrada', () => {
  //   const inputDate1 = '2023-10-09';
  //   const inputDate2 = '10/09/2023';
  //   const expectedOutput = '09/10/2023';
  //   expect(dateFormat(inputDate1, 'yyyy-MM-dd', 'dd/MM/yyyy')).toBe(expectedOutput);
  //   expect(dateFormat(inputDate2, 'dd/MM/yyyy', 'dd/MM/yyyy')).toBe(expectedOutput);
  // });

  // it('Prueba de manejo de localización/región', () => {
  //   const inputDate = '2023-10-09';
  //   const expectedOutputUS = '10/09/2023'; // Formato estadounidense
  //   const expectedOutputES = '09/10/2023'; // Formato español
  //   expect(dateFormat(inputDate, 'yyyy-MM-dd', 'dd/MM/yyyy', 'en-US')).toBe(expectedOutputUS);
  //   expect(dateFormat(inputDate, 'yyyy-MM-dd', 'dd/MM/yyyy', 'es-ES')).toBe(expectedOutputES);
  // });
});

describe('formatCurrency', () => {
  // Prueba 1: Formatear un número en soles peruanos (PEN)
  it('debería formatear un número en soles peruanos (PEN)', () => {
    const resultado = formatCurrency(1000, 'PEN');
    expect(resultado).toBe('S/1,000.00'); // Asegura que el resultado sea el esperado
  });

  // Prueba 2: Formatear un número en dólares estadounidenses (USD)
  it('debería formatear un número en dólares estadounidenses (USD)', () => {
    const resultado = formatCurrency(1000, 'USD');
    expect(resultado).toBe('$1,000.00'); // Asegura que el resultado sea el esperado
  });

  // Prueba 3: Formatear un número en euros (EUR)
  it('debería formatear un número en euros (EUR)', () => {
    const resultado = formatCurrency(1000, 'EUR');
    expect(resultado).toBe('1.000,00€'); // Asegura que el resultado sea el esperado
  });

  // Prueba 4: Formatear un número en una moneda no válida (debería devolver "0")
  it('debería devolver "0" para una moneda no válida', () => {
    const resultado = formatCurrency(1000, 'GBP');
    expect(resultado).toBe('0'); // Asegura que el resultado sea "0"
  });
});

describe('formatTime function', () => {
  it('Formato de hora válida en formato de 12-horas.', () => {
    expect(formatTime('05:10')).toBe('05:10 AM');
    expect(formatTime('08:20')).toBe('08:20 AM');
    expect(formatTime('11:59')).toBe('11:59 AM');
    expect(formatTime('14:45')).toBe('02:45 PM');
    expect(formatTime('20:59')).toBe('08:59 PM');
    expect(formatTime('23:59')).toBe('11:59 PM');
  });

  it('Maneja el formato con segundos.', () => {
    expect(formatTime('05:10:00')).toBe('05:10 AM');
    expect(formatTime('08:20:10')).toBe('08:20 AM');
    expect(formatTime('11:59:25')).toBe('11:59 AM');
    expect(formatTime('14:45:30')).toBe('02:45 PM');
    expect(formatTime('20:59:45')).toBe('08:59 PM');
    expect(formatTime('23:59:59')).toBe('11:59 PM');
  });

  it('Formato de hora con segundos de 12-horas.', () => {
    expect(formatTime('05:10:00', true)).toBe('05:10:00 AM');
    expect(formatTime('08:20:10', true)).toBe('08:20:10 AM');
    expect(formatTime('11:59:25', true)).toBe('11:59:25 AM');
    expect(formatTime('14:45:30', true)).toBe('02:45:30 PM');
    expect(formatTime('20:59:45', true)).toBe('08:59:45 PM');
    expect(formatTime('23:59:59', true)).toBe('11:59:59 PM');
  });

  it('Maneja la medía noche (12:00 AM) correctamente.', () => {
    expect(formatTime('00:00')).toBe('12:00 AM');
    expect(formatTime('12:00')).toBe('12:00 PM');
  });

  it('Retorna "Hora no válida" por entradas invalidas.', () => {
    expect(formatTime('abc')).toBe('Invalid Time');
    expect(formatTime('25:30')).toBe('Invalid Time');
    expect(formatTime('-3:60')).toBe('Invalid Time');
    expect(formatTime('12:60:')).toBe('Invalid Time');
    expect(formatTime('12:40:60')).toBe('Invalid Time');
  });
});

describe('rounded function', () => {
  it('Redondea la cantidad positiva con la configuración predeterminada.', () => {
    expect(rounded(12345.67)).toBe('12345.67');
    expect(rounded(3322.6756)).toBe('3322.68');
    expect(rounded(102345.67)).toBe('102345.67');

    expect(rounded(-12345.6739)).toBe('-12345.67');
    expect(rounded(-3322.6756)).toBe('-3322.68');
    expect(rounded(-102345.67)).toBe('-102345.67');

    expect(rounded(3322.6756)).toBe('3322.68');
    expect(rounded(10.1)).toBe('10.10');
    expect(rounded(10.99)).toBe('10.99');
    expect(rounded(10.998)).toBe('11.00');
    expect(rounded(10.9956)).toBe('11.00');
  });

  it('Formatos cantidad cero.', () => {
    expect(rounded(0)).toBe('0.00');
  });

  it('Menaja entredas no válidas.', () => {
    expect(rounded('abc')).toBe('0');
    expect(rounded(null)).toBe('0');
  });
});

describe('formatDecimal function', () => {
  it('Formatea la cantidad positiva con la configuración predeterminada.', () => {
    expect(formatDecimal(12345.67)).toBe('12,345.67');
    expect(formatDecimal(3322.6756)).toBe('3,322.68');
    expect(formatDecimal(102345.67)).toBe('102,345.67');

    expect(formatDecimal(-12345.6739)).toBe('-12,345.67');
    expect(formatDecimal(-3322.6756)).toBe('-3,322.68');
    expect(formatDecimal(-102345.67)).toBe('-102,345.67');

    expect(formatDecimal(3322.6756)).toBe('3,322.68');
    expect(formatDecimal(10.1)).toBe('10.10');
    expect(formatDecimal(10.99)).toBe('10.99');
    expect(formatDecimal(10.998)).toBe('11.00');
    expect(formatDecimal(10.9956)).toBe('11.00');
  });

  it('Formatea la cantidad negativa con la configuración predeterminada.', () => {
    expect(formatDecimal(-9876.54)).toBe('-9,876.54');
  });

  it('Formatea la cantidad con separadores decimales y de miles personalizados.', () => {
    expect(formatDecimal(54321.789, 3, '.')).toBe('54,321.789');
  });

  it('Formatos cantidad cero.', () => {
    expect(formatDecimal(0)).toBe('0.00');
  });

  it('Menaja entredas no válidas.', () => {
    expect(formatDecimal('abc')).toBe('0.00');
    expect(formatDecimal(null)).toBe('0.00');
  });
});

describe('currentDate function', () => {
  it('Retorna el fecha actual en el formato esperado.', () => {
    const expectedFormat = /^\d{4}-\d{2}-\d{2}$/; // Formato esperado (yyyy-MM-dd)

    const result = currentDate();

    expect(result).toMatch(expectedFormat);
  });
});

describe('currentTime function', () => {
  it('Retorna la hora actual en el formato esperado.', () => {
    const expectedFormat = /^\d{2}:\d{2}:\d{2}$/; // Formato esperado (HH:mm:ss)

    const result = currentTime();

    expect(result).toMatch(expectedFormat);
  });

  test('Ejemplo de prueba con toMatch', () => {
    const cadena = 'Hola, mundo!';
    expect(cadena).toMatch(/mundo/);
  });
});

describe('currentDate', () => {
  it('Debe devolver la fecha actual en el formato "YYYY-MM-DD"', () => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/; // Expresión regular para el patrón de fecha 'YYYY-MM-DD'
    const result = currentDate();
    expect(result).toMatch(datePattern);
  });
});

describe('currentTime', () => {
  it('Debe devolver la hora actual en el formato "HH:MM:SS"', () => {
    const timePattern = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/; // Expresión regular para el patrón de hora 'HH:MM:SS'
    const result = currentTime();
    expect(result).toMatch(timePattern);
  });
});

describe('formatNumberWithZeros', () => {
  test('debería formatear correctamente el número', () => {
    expect(formatNumberWithZeros(1)).toBe('000001');
    expect(formatNumberWithZeros(11)).toBe('000011');
    expect(formatNumberWithZeros(111)).toBe('000111');
    expect(formatNumberWithZeros(1111)).toBe('001111');
    expect(formatNumberWithZeros(11111)).toBe('011111');
    expect(formatNumberWithZeros(111111)).toBe('111111');
  });

  test('debería manejar números negativos', () => {
    expect(formatNumberWithZeros(-1)).toBe('-000001');
  });

  test('debería manejar números con más de 6 dígitos', () => {
    expect(formatNumberWithZeros(1234567)).toBe('1234567');
  });
});

// describe('imageBase64', () => {
//   beforeAll(() => {
//     jest.setTimeout(10000); // Ajusta el tiempo de espera a 10 segundos (10000 ms)
//   });

//   it('debería devolver un objeto que contiene la representación en base64 del archivo, su extensión, ancho y altura; o false si no se selecciona ningún archivo', async () => {
//     const files = [
//       new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' }),
//     ]; // Simulando un archivo de imagen
//     console.log(files[0].name)
//     const result = await imageBase64(files);

//     // if (result) {
//     const expectedResultKeys = ['base64String', 'extension', 'width', 'height'];
//     const resultKeys = Object.keys(result);
//     expect(resultKeys).toEqual(expect.arrayContaining(expectedResultKeys));
//     // } else {
//     // expect(result).toBe(false);
//     // }
//   });
// });
