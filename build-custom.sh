for fullpath in ./*.js
do

  if [[ $fullpath = *"index"* ]]; then
    continue
  fi
  if [[ $fullpath = *"config.js"* ]]; then
    continue
  fi

  npm run build-custom -- --env filename=./$fullpath

  filename="${fullpath##*/}"                      # Strip longest match of */ from start
  dir="${fullpath:0:${#fullpath} - ${#filename}}" # Substring from 0 thru pos of filename
  base="${filename%.[^.]*}"                       # Strip shortest match of . plus at least one non-dot char from end
  ext="${filename:${#base} + 1}"                  # Substring from len of base thru end
  if [[ -z "$base" && -n "$ext" ]]; then          # If we have an extension and no base, it's really the base
      base=".$ext"
      ext=""
  fi

done
