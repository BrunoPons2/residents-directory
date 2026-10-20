# Interactive village map - local review

Implemented 20 October 2026. Bruno reviewed the prototype and approved commit/push and preview refresh on 20 October 2026.

## Review locally

Open http://127.0.0.1:8765/ while the local preview server is running.

- Open a resident photo popup and select Map, immediately after Email.
- Select Village Map from the directory header to browse without a resident.
- Try `86`, `Wendy Blain`, `86 Melody Street`, and `107 Lakeview Drive`.
- Click a plot, select a listed resident, then close the resident popup to return to the map.
- Test the mouse scroll wheel (up to zoom in, down to zoom out, centred on the pointer), +, -, Show whole village, dragging, keyboard arrow keys and Escape.

## Files

- `index.html`: main Village Map button, fourth resident action, map dialog and script.
- `app.js`: profile-open event, map-aware floating navigation and Escape handling.
- `map.js`: map loading, plot selection, searches, households, shared popup integration, zoom and pointer gestures.
- `maps/natura-site-map.jpg`: exact copy of the selected original; original untouched.
- `maps/houses.json`: coordinates for all 111 plots in a 1600-unit image coordinate system, known directory address aliases and map street labels.
- `styles.css`: responsive dialog, accessible controls, plot highlighting and four profile actions.
- `sw.js`: shell cache v13 and map assets; existing data/photo bypass rules unchanged.
- `PROJECT_CONTEXT.md`: local implementation checkpoint.

## Data behaviour

Resident details always come from the app's loaded CSV, including its existing offline fallback. Resident IDs are not house numbers. The map joins numbered addresses to the village's unique house numbers. Multiple occupants appear separately. Missing directory entries are labelled "No resident details listed". Staff/non-house entries have no profile Map action. Searches normalise common street abbreviations; numeric query terms match exact house numbers.

The map's frontage labels are search aids rather than corrections to the directory. In particular, plot 12 appears beside Jubilee Street on the image while its directory entry is 12 Trotter Road. Existing directory addresses are preserved. Street frontage for plots without a directory entry is inferred from the map and should be confirmed during owner review.

The image's printed YOU ARE HERE marker is part of the source illustration and is not device GPS. No location permission or external mapping service is used.

## Validation

Passed JavaScript syntax checks and git diff whitespace checks. Automated headless Microsoft Edge checks covered all 111 loaded plot elements, exact house search, name search, address aliases, unlisted plot search, no-result search, direct plot click, multiple occupants, shared resident popup, preserved map view after popup close, Escape closing only the top dialog, zoom, mobile fourth-button order, staff Map exclusion, no map horizontal overflow, and no JavaScript errors. Chromium touch emulation passed two-finger pinch and single-finger pan. After online installation, cached offline app reload, map assets, resident search and household display passed.

Desktop and 390px phone screenshots were visually reviewed, including a temporary plot-outline audit and the four-button profile row. Coordinate coverage is checked for exactly houses 1 through 111. Mouse-wheel tests passed for both zoom directions, pointer anchoring, zoom limits and no zoom when scrolling outside the map. Real iPhone/Android device testing remains for owner review; emulation does not replace that check.

## Publication

Bruno explicitly approved committing and pushing this prototype after local review. Mouse-wheel zoom is centred on the pointer and uses the finer steps he requested. Resident data and the master workbook are unchanged.
