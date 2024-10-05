#!/bin/bash

output_file="resources.cfg"
ignore_folders=("[dependencies]" "[local]")

> "$output_file"  # Clear the output file

find ./resources -type f -name "fxmanifest.lua" | while read -r manifest; do
    folder_name=$(dirname "$manifest" | xargs basename)
    ignore=false
    for ignore_folder in "${ignore_folders[@]}"; do
        if [[ "$manifest" == *"/$ignore_folder/"* ]]; then
            ignore=true
            break
        fi
    done
    if [ "$ignore" = false ]; then
        echo "ensure $folder_name" >> "$output_file"
    fi
done
