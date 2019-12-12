const express = require('express');
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE ||'./database.sqlite');
const artistsRouter = express.Router();


artistsRouter.param('artistId',(req,res,next,id)=>{
  db.get('SELECT * FROM Artist WHERE id = $id;', {$id:id},
    (err,artist)=>{
      if(err){
        next(err);
      }
      if(!artist){
        res.sendStatus(404);
        return
      }
      req.artist=artist;
      next();
  });
});

artistsRouter.get('/',(req,res,next)=>{
  db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`,(err,rows)=>{
    if(err){
      next(err);
    };
    res.status(200).json({artists: rows});
  })
});

artistsRouter.get('/:artistId',(req,res,next)=>{
  res.status(200).json({artist:req.artist})
})

artistsRouter.post('/',(req,res,next)=>{
  if(req.body.artist.name && req.body.artist.dateOfBirth && req.body.artist.biography){
    if (!req.body.artist.is_currently_employed){
      req.body.artist.is_currently_employed = 1;
    };
    const sql = 'INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($name, $dateOfBirth, $biography, $isCurrentlyEmployed)';
    const values = {
      $name: req.body.artist.name,
      $dateOfBirth: req.body.artist.dateOfBirth,
      $biography: req.body.artist.biography,
      $isCurrentlyEmployed: req.body.artist.is_currently_employed
    };
    db.run(sql, values, function(error) {
      if(error){
        next(error);
      }
      db.get('SELECT * FROM Artist WHERE id = $id;',{
        $id: this.lastID
      },(err,artist)=>{
          res.status(201).json({artist: artist});
      })
    });
  } else {
    res.sendStatus(400);
  }
})

artistsRouter.put('/:artistId',(req,res,next)=>{
  const name = req.body.artist.name;
  const dateOfBirth = req.body.artist.dateOfBirth;
  const biography =req.body.artist.biography;
  const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed;
  if (name && dateOfBirth && biography && isCurrentlyEmployed){
    const sql = 'UPDATE Artist SET name = $name, date_of_birth = $dateOfBirth, biography = $biography, is_currently_employed = $isCurrentlyEmployed WHERE Artist.id = $artistId';
    const values = {
      $name: name,
      $dateOfBirth: dateOfBirth,
      $biography: biography,
      $isCurrentlyEmployed: isCurrentlyEmployed,
      $artistId: req.params.artistId
    };
    db.run(sql, values, (error) => {
      if(error){
        next(error);
      } else {
        db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`,(err,artist)=>{
          if(err){
            next(err);
          }
          res.status(200).json({artist:artist})
        })
      }
    });
  } else{
    res.sendStatus(400);
  }
})


artistsRouter.delete('/:artistId',(req,res,next)=>{
  db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE id = ${req.artist.id}`,(err)=>{
    if(err){
      next(err);
    } else{
      db.get(`SELECT * FROM Artist WHERE id = ${req.artist.id}`,(err,artist)=>{
        if(err){
          next(err);
        } else{
          res.status(200).json({artist:artist})
        }
      })
    }

  })
})

module.exports = artistsRouter;