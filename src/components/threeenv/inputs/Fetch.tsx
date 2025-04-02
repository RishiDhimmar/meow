import { BACKEND_URL } from "../../../Constants";

export async function fetchWallData() {
  try {
    const response = await fetch(
      BACKEND_URL + "api/dxf-entities"
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch wall data. Status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching wall data:", error);
    return null;
  }
}
