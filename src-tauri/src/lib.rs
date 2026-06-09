use pyo3::prelude::*;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

pub fn tauri_generate_context() -> tauri::Context {
    tauri::generate_context!()
}

#[tauri::command]
fn load_pump_config(app: AppHandle, address: String) -> Option<serde_json::Value> {
    let store = app.store("pump_configs.json").ok()?;
    store.get(&address)
}

#[tauri::command]
fn save_pump_config(app: AppHandle, address: String, config: serde_json::Value) {
    if let Ok(store) = app.store("pump_configs.json") {
        store.set(address, config);
        store.save().ok();
    }
}

#[pymodule(gil_used = false)]
#[pyo3(name = "ext_mod")]
pub mod ext_mod {
    use super::*;

    #[pymodule_init]
    fn init(module: &Bound<'_, PyModule>) -> PyResult<()> {
        pytauri::pymodule_export(
            module,
            |_args, _kwargs| Ok(tauri_generate_context()),
            |_args, _kwargs| {
                let builder = tauri::Builder::default()
                    .plugin(tauri_plugin_opener::init())
                    .plugin(tauri_plugin_store::Builder::new().build())
                    .invoke_handler(tauri::generate_handler![
                        greet,
                        load_pump_config,
                        save_pump_config,
                    ]);
                Ok(builder)
            },
        )
    }
}
