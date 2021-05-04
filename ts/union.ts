// between types
let str: string | undefined;


// between interfaces
interface Vehicle {
	speed: number;
}
interface Bike extends Vehicle {
	ride: () => void;
}
interface Plane extends Vehicle {
	fly: () => void;
}
function useVehicle(vehicle: Bike | Plane) {
	//do that
}



enum Vehicles {
	bike,
	plane
}
interface Vehicle {
	speed: number;
	type: Vehicles;
}
interface Bike extends Vehicle {
	ride: () => void;
	type: Vehicles.bike;
}
interface Plane extends Vehicle {
	fly: () => void;
	type: Vehicles.plane;
}
function usingVehicle(vehicle: Bike | Plane) {
	if (vehicle.type === Vehicles.bike) {
		vehicle.ride();
	}
	if (vehicle.type === Vehicles.plane) {
		vehicle.fly();
	}
}