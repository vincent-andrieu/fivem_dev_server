import { bootstrapApplication as initializeApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { appConfig } from "./app/app.config";

initializeApplication(AppComponent, appConfig).catch((err) => console.error(err));
