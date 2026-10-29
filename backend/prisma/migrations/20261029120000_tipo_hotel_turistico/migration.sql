-- "Hotel Turistico" lo ofrecia el formulario de ventas desde junio (c9a9070) sin existir en el
-- enum, y toda venta con ese tipo fallaba con un 500. Se agrega como tipo real.

-- AlterEnum
ALTER TYPE "TipoHotel" ADD VALUE 'hotel_turistico';
