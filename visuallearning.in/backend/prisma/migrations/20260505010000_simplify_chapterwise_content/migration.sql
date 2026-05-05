-- Keep video ordering in the order column instead of duplicating it in titles.
UPDATE "Video"
SET
  "title" = btrim(regexp_replace("title", '^[[:space:]]*[0-9]+([.)]|[-:]|[[:space:]])+[[:space:]]*', '')),
  "type" = 'ANIMATED_VIDEO'
WHERE
  "type" = 'LECTURE_VIDEO'
  OR "title" ~ '^[[:space:]]*[0-9]+([.)]|[-:]|[[:space:]])+[[:space:]]*';
